import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import TerminalView from "./components/TerminalView";

export default function App() {
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);

  const connectSSH = async () => {
    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : window.location.origin;

    try {
      await fetch(`${API_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, username, password }),
      });

      setConnected(true);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#000",
        color: "#fff",
        height: "100vh",
      }}
    >
      {!connected ? (
        <LoginForm
          host={host}
          username={username}
          password={password}
          setHost={setHost}
          setUsername={setUsername}
          setPassword={setPassword}
          onConnect={connectSSH}
        />
      ) : (
        <TerminalView
          host={host}
          username={username}
          password={password}
        />
      )}
    </div>
  );
}
