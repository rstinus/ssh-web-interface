import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalView({ host, username, password, initialText }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Init terminal
    const term = new Terminal({
      cols: 100,
      rows: 28,
      theme: { background: "#000", foreground: "#0F0" },
      cursorBlink: true,
    });

    term.open(containerRef.current);
    termRef.current = term;

    // affiche le message initial si fourni
    if (initialText) {
      term.writeln(initialText);
    }

    term.writeln("Connexion...\n");

    startWebSocket(term);

    return () => {
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

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
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "data") term.write(msg.data);
      if (msg.type === "error") term.writeln("\n" + msg.error);
    };

    term.onData((data) => {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stdin", data }));
      }
    });
  };

  return (
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
  );
}
