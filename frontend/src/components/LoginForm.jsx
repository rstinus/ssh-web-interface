import React from "react";

export default function LoginForm({
  host,
  username,
  password,
  setHost,
  setUsername,
  setPassword,
  onConnect,
}) {
  return (
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

      <button onClick={onConnect}>Se connecter</button>
    </div>
  );
}
