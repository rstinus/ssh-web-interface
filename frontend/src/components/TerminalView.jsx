// TerminalView.js
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import CommandInput from "./CommandInput.jsx";

export default function TerminalView({ host, username, password, initialText, onDisconnect }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendCommandToTerminal = (command) => {
  if (!termRef.current || !wsRef.current) return;

  // Simule la saisie caractère par caractère
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    // Envoie chaque caractère au terminal local (xterm)
    termRef.current.write(char);
    // Envoie chaque caractère au serveur SSH via WebSocket
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stdin", data: char }));
    }
    // Petit délai pour simuler la saisie humaine (optionnel)
    if (i < command.length - 1) {
      setTimeout(() => {}, 10); // 10ms entre chaque caractère
    }
  }
  // Envoie un retour chariot à la fin
  termRef.current.write("\r");
  if (wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({ type: "stdin", data: "\r" }));
  }
};

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
    if (initialText) term.writeln(initialText);
    term.writeln("Connexion...\n");
    startWebSocket(term);
    return () => {
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Dans TerminalView.js
const startWebSocket = (term) => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const WS_URL =
    window.location.hostname === "localhost"
      ? "ws://localhost:3001"
      : `${protocol}://${window.location.host}`;
  wsRef.current = new WebSocket(WS_URL);
  wsRef.current.onopen = () => {
    term.writeln("Connexion SSH établie.");
    wsRef.current.send(
      JSON.stringify({ type: "connect", host, username, password })
    );
    setIsConnected(true);
  };
  wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "data") term.write(msg.data);
      if (msg.type === "error") term.writeln("\n" + msg.error);
    };
    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stdin", data }));
      }
    });
};

  return (
    <div>
      <CommandInput onSendCommand={sendCommandToTerminal} onDisconnect={onDisconnect}/>
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          background: "#000",
          borderRadius: "5px",
          marginTop: 20,
        }}
      />
    </div>
  );
}