const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Client } = require("ssh2");
const path = require("path");
const { exec } = require('child_process');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cors = require('cors');

app.use(cors());

// Correction ici : __dirname est déjà dispo en CommonJS
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(express.json());

app.post('/api/session', (req, res) => {
  const { host, username, password } = req.body;

  if (!host || !username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Paramètres manquants' 
    });
  }

  // On accepte la demande, SSH vérifiera les identifiants
  res.json({ 
    success: true, 
    sessionId: Date.now()
  });
});

wss.on('connection', (ws) => {
  console.log('[MSG] Nouveau client WebSocket connecté');

  let sshStream;

  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());

    // Quand le navigateur demande la connexion SSH
    if (msg.type === 'connect') {
      const { host, username, password } = msg;
      const conn = new Client();

      
      // Ajout de whitelist pour éviter les abus
      const ALLOWED_HOSTS = ['127.0.0.1', 'remystinus.fr'];

      if (!ALLOWED_HOSTS.includes(host)) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Host non autorisé'
        }));
        return;
      }

      conn.on('ready', () => {
        console.log(`_/ SSH connecté à ${host}`);
        conn.shell((err, stream) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'error', error: err.message }));
            return;
          }
          sshStream = stream;

          // Quand le serveur envoie des données
          stream.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
          });

          stream.stderr.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
          });

          stream.on('close', () => {
            ws.send(JSON.stringify({ type: 'info', data: '\r\n X Connexion fermée\r\n' }));
            conn.end();
          });
        });
      })
      .on('error', (err) => {
        console.error('Erreur SSH :', err.message);
        ws.send(JSON.stringify({ type: 'error', error: err.message }));
      })
      .connect({ host, username, password, readyTimeout: 10000 });
    }

    // Quand le navigateur envoie une touche
    else if (msg.type === 'stdin' && sshStream) {
      sshStream.write(msg.data);
    }
  });

  ws.on('close', () => {
    if (sshStream) sshStream.end();
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

console.log("PORT utilisé :", process.env.PORT);
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
