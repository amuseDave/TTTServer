const { lobbies } = require("../models/Lobby");
const { joinLobbyHelper } = require("./joinLobby");

module.exports = (ws) => {
  if (!ws.lobbyID) return;

  const lobby = lobbies.getLobby(ws.lobbyID);
  if (lobby.players.length > 1) return;

  const curPlayer = lobby.players[0];
  const foundLobby = lobbies.findLobby(ws.lobbyID);

  if (!foundLobby) {
    curPlayer.sendToClient({
      action: "display-alert",
      type: "find-lobby",
      data: {
        message: "Lobby Not Found",
        alert: "error",
      },
    });
  } else {
    curPlayer.isAdmin = false;
    lobbies.lobbies.delete(ws.lobbyID);
    joinLobbyHelper(ws, foundLobby, curPlayer);

    curPlayer.sendToClient({
      action: "display-alert",
      type: "find-lobby",
      data: {
        message: "Lobby Found",
        alert: "success",
      },
    });
  }
};
