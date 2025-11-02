const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client } = require('ssh2');
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Sert les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(express.json()); // Ajouter le middleware pour parser le JSON

// Pour toute autre route, renvoie index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.post('/api/session', (req, res) => {
  const { host, username, password } = req.body;
  // Validation basique
  if (!host || !username || !password) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  res.json({ status: 'success', message: 'Session initiée' });
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
      .connect({ host, username, password });
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

console.log("PORT utilisé :", process.env.PORT);
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
