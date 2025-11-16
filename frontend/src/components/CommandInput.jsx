import React, { useState } from "react";

export default function CommandInput({onSendCommand, onDisconnect}) {
  const [command, setCommand] = useState("ls");
  const [argument, setArgument] = useState("");

  const commandesAutorisees = ['ls', 'mkdir', 'touch', 'rm', 'rmdir', 'clear', 'cd', 'man', 'cp', 'cat'];

  const contientCaracteresDangereux = (input) => /[|;&$><`\n]/.test(input);

  const handleSubmit = (e) => {
    e.preventDefault();
    const commandeComplete = `${command} ${argument}`;

    const [cmd] = commandeComplete.trim().split(' ');
    if (!commandesAutorisees.includes(cmd)) {
      alert(`Commande non autorisée : ${cmd}`);
      return;
    }

    if (contientCaracteresDangereux(commandeComplete)) {
      alert("Caractères interdits détectés (| ; & $ > < `) !");
      return;
    }

    if (cmd === 'rm' || cmd === 'rmdir') {
      const confirmation = window.confirm(
        `Attention : La commande "${commandeComplete}" est irréversible. Continuer ?`
      );
      if (!confirmation) return;
    }

    onSendCommand(commandeComplete);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <select
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        style={inputStyle}
      >
        <option value="ls">Lister les fichiers</option>
        <option value="mkdir">Créer un dossier</option>
        <option value="touch">Créer un fichier</option>
        <option value="rm">Supprimer un fichier</option>
        <option value="rmdir">Supprimer un dossier</option>
        <option value="clear">Nettoyer le terminal</option>
        <option value="cd">Changement de dossier</option>
        <option value="man">Manuel d'une commande</option>
        <option value="cp">Copie d'un fichier</option>
        <option value="nano">Editer un fichier</option> 
        <option value="cat">Montrer le contenu d'un fichier</option>
      </select>
      <input
        type="text"
        value={argument}
        onChange={(e) => setArgument(e.target.value)}
        placeholder="Argument"
        style={inputStyle}
      />
      <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "10px" }}>
        <button style={buttonStyleExec}>
          Exécuter
        </button>
        <button style={buttonStyleDeco} onClick={onDisconnect}>
          Se déconnecter
        </button>
      </div>
    </form>
  );
}  
  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "80%",
    padding: 20,
    background: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    marginLeft: 90,
  };

  const inputStyle = {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: 8,
    border: "1px solid #444",
    background: "#0b0b0b",
    color: "#fff",
    width: "70%",
  };

  const buttonStyleExec = {
    fontSize: "1.25rem",
    padding: "10px",
    width: "25%",
    borderRadius: 10,
    cursor: "pointer",
    border: "none",
    color: "#fff",
    backgroundColor: "#1e90ff",
  };

  const buttonStyleDeco = {
    fontSize: "1.25rem",
    padding: "10px",
    width: "25%",
    borderRadius: 10,
    cursor: "pointer",
    border: "none",
    color: "#fff",
    backgroundColor: "#ff000dff",
  };