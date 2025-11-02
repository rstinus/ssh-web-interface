export const WS_URL = (() => {
  if (window.location.hostname === "localhost") {
    return "ws://localhost:3001"; // dev local
  }
  // production: même host que le frontend, WSS si HTTPS
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}`;
})();
