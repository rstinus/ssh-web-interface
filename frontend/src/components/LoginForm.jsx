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
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    maxWidth: 500,        // petit bloc centré
    padding: 20,
    background: "rgba(0,0,0,0.5)",  // fond léger pour la lisibilité
    borderRadius: 12,
  };

  const inputStyle = {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: 8,
    border: "1px solid #444",
    background: "#0b0b0b",
    color: "#fff",
    width: "100%",
  };

  const buttonStyle = {
    fontSize: "1.25rem",
    padding: "12px",
    width: "100%",
    borderRadius: 10,
    cursor: "pointer",
    border: "none",
    backgroundColor: "#1e90ff",
    color: "#fff",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={containerStyle}>
        <input
          style={inputStyle}
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="Hôte"
        />
        <input
          style={inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Utilisateur"
        />
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />

        <button style={buttonStyle} onClick={onConnect}>
          Se connecter
        </button>
      </div>
    </div>
  );
}
