import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import TerminalView from "./components/TerminalView";
import "./App.css";

export default function App() {
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);

  const connectSSH = async () => {
    if (!host || !username || !password) {
      alert("Remplissez tous les champs");
      return;
    }

    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : window.location.origin;

    try {
      const res = await fetch(`${API_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setConnected(true);
      } else {
        alert("Erreur : " + data.error);
      }
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
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
        <div>
          <iframe class="inputCmd"
            src="/InputCmd.html"
            title="InputCmd"
          />
          <TerminalView
            host={host}
            username={username}
            password={password}
            initialText={"Entrez vos identifiants ci-dessus pour vous connecter.\r\n"}
          />
        </div>
      )}
    </div>
  );
}

        