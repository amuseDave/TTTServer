const { lobbies } = require("../models/Lobby");

module.exports = (ws, data) => {
  if (!ws.lobbyID) return;
  if (typeof data.username !== "string") return;
  if (data.username.trim().length < 3 || data.username.trim().length > 15) return;

  const lobby = lobbies.getLobby(ws.lobbyID);
  if (lobby.isGameStarted) return;

  lobby.players.forEach((player) => {
    if (player.playerID === ws.playerID) {
      player.username = data.username;
    } else {
      player.sendToClient({
        action: "update-username",
        data: { username: data.username },
      });
    }
  });
};
