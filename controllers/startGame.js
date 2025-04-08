const { lobbies } = require("../models/Lobby");
const { lobbyInterval } = require("../utils");

module.exports = (ws) => {
  if (!ws.lobbyID) return;

  const lobby = lobbies.getLobby(ws.lobbyID);

  if (lobby.isGameStarted) return;

  const player = lobby.getPlayer(ws.playerID);

  if (!ws.isAdmin) {
    if (player.isAdmin) ws.isAdmin = true;
  }
  if (!ws.isAdmin || lobby.players.length < 2) return;

  lobby.isGameStarted = true;

  lobby.players.forEach((player) => {
    player.sendToClient({ action: "start-game" });
  });

  // Start interval to update the timelimit and skip turn if the timelimit is empty

  lobby.intervalID = setInterval(() => {
    lobbyInterval(lobby);
  }, 1000);
};
