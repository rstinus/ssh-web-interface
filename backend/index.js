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

// Pour toute autre route, renvoie index.html

app.post('/api/session', (req, res) => {
  const { host, username, password } = req.body;

  // Validation basique
  if (!host || !username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Paramètres manquants' 
    });
  }

  // Vérifiez les identifiants (exemple simple)
  if (username === "rstinusssh" && password === "SSH27102006*") {
    return res.json({ 
      success: true, 
      message: 'Connexion réussie',
      sessionId: Date.now() 
    });
  }

  // Identifiants incorrects
  res.status(401).json({ 
    success: false, 
    error: 'Identifiants incorrects' 
  });
});

app.post('/executer-commande', (req, res) => {
  const commande = req.body.commande;

  // Validation sécurisé : n'autoriser que certaines commandes et arguments
  const commandesAutorisees = ['ls', 'mkdir', 'rm'];
  const [cmd, ...args] = commande.split(' ');
  if (!commandesAutorisees.includes(cmd)) {
    return res.status(400).json({ resultat: 'Commande non autorisée.' });
  }

  // Exécution sécurisée
  exec(commande, (error, stdout, stderr) => {
    if (error) return res.json({ resultat: `Erreur : ${error.message}` });
    res.json({ resultat: stdout || stderr });
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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

console.log("PORT utilisé :", process.env.PORT);
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
