import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { WS_URL } from "./config";

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

    const connectSSH = async () => {
  // Construire l’URL du backend dynamiquement
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3001"
      : window.location.origin;

  // 1️⃣ Appel API pour créer une session
  try {
    const res = await fetch(`${API_URL}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, username, password }),
    });

    const data = await res.json();
    console.log("Session créée :", data);
  } catch (err) {
    console.error("Erreur lors de la création de session :", err);
    termRef.current.writeln(`\r\n❌ Erreur API: ${err.message}\r\n`);
    return;
  }

  // 2️⃣ Connexion WebSocket après l'API
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const WS_URL =
    window.location.hostname === "localhost"
      ? "ws://localhost:3001"
      : `${protocol}://${window.location.host}`;

  wsRef.current = new WebSocket(WS_URL);

  wsRef.current.onopen = () => {
    termRef.current.writeln("Connexion au serveur SSH...");
    wsRef.current.send(
      JSON.stringify({ type: "connect", host, username, password })
    );
  };

  wsRef.current.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "data") termRef.current.write(msg.data);
    else if (msg.type === "error")
      termRef.current.writeln(`\r\n❌ ${msg.error}\r\n`);
    else if (msg.type === "info") termRef.current.writeln(msg.data);
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
