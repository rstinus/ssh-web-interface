import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function App() {
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);
  const termRef = useRef(null);
  const containerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialisation du terminal
    const term = new Terminal({
      cols: 100,
      rows: 28,
      theme: { background: "#000", foreground: "#0F0" },
      cursorBlink: true,
    });

    term.open(containerRef.current);
    termRef.current = term;

    // Message d’accueil (avant connexion)
    term.writeln("Terminal SSH Web");
    term.writeln("Entrez vos identifiants ci-dessus pour vous connecter.\r\n");

    return () => term.dispose(); // cleanup
  }, []);

    const connectSSH = () => {
    if (!host || !username || !password) return;

    // Correction de l'URL WebSocket
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    let host = window.location.host;

    // En local, on force le port 3001 (backend)
    if (host.includes("localhost")) {
      host = "localhost:3001";
    }

    wsRef.current = new WebSocket(`${protocol}://${host}`);



    // pour les requêtes HTTP
    const apiUrl = window.location.origin;
    fetch(`${apiUrl}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        host,
        username,
        password
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Session created:', data);
    })
    .catch(error => {
      console.error('Error creating session:', error);
      termRef.current.writeln(`\r\nErreur de connexion: ${error.message}\r\n`);
    });

    wsRef.current.onopen = () => {
      console.log("WebSocket connecté");
      termRef.current.writeln("Connexion au serveur SSH...");
      wsRef.current.send(
        JSON.stringify({ type: "connect", host, username, password })
      );
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      termRef.current.writeln("\r\nErreur de connexion WebSocket\r\n");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket fermé");
      termRef.current.writeln("\r\nConnexion WebSocket fermée\r\n");
    };

    termRef.current.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stdin", data }));
      }
    });

    setConnected(true);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", color: "#fff", backgroundColor: "#111", height: "100vh" }}>
      {/* Inputs avant connexion */}
      {!connected && (
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Hôte (ex: 192.168.1.10)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            style={{ marginRight: "5px" }}
          />
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginRight: "5px" }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: "5px" }}
          />
          <button onClick={connectSSH}>Se connecter</button>
        </div>
      )}

      {/* Terminal */}
      <div
        ref={containerRef}
        style={{
          height: "500px",
          width: "100%",
          backgroundColor: "#000",
          borderRadius: "5px",
          marginTop: connected ? "10px" : "0", // juste pour l'espace après inputs
        }}
      />
    </div>
  );
}
