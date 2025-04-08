const { lobbies } = require("../models/Lobby");

module.exports = (ws) => {
  if (!ws.lobbyID) return;

  const lobby = lobbies.getLobby(ws.lobbyID);

  if (lobby.isGameStarted) return;
  if (!ws.isAdmin) {
    const player = lobby.getPlayer(ws.playerID);
    if (player.isAdmin) ws.isAdmin = true;
  }
  if (!ws.isAdmin) return;

  lobby.players.forEach((player) => {
    player.move = player.move === "X" ? "O" : "X";
    player.sendToClient({ action: "switch-moves", data: { move: player.move } });
  });
};
