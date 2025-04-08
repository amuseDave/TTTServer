const { v4: uuidv4 } = require("uuid");
const { lobbies } = require("../models/Lobby");
const { Player } = require("../models/Player");

function joinLobby(ws, data) {
  if (ws.lobbyID || typeof data.lobbyID !== "string") return;

  const lobby = lobbies.getLobby(data.lobbyID);

  if (!lobby || lobby.players.length > 1) {
    return ws.send(JSON.stringify({ action: "join-lobby", data: null }));
  }

  joinLobbyHelper(ws, lobby);
}

function joinLobbyHelper(ws, curLobby, newPlayer = null) {
  const existingPlayer = curLobby.players[0];

  if (!newPlayer) newPlayer = new Player(ws.send.bind(ws), uuidv4(), false);

  newPlayer.move = existingPlayer.move === "X" ? "O" : "X";

  curLobby.addPlayer(newPlayer);

  ws.lobbyID = curLobby.lobbyID;
  ws.playerID = newPlayer.playerID;
  ws.isAdmin = newPlayer.isAdmin;

  newPlayer.sendToClient({
    action: "join-lobby",
    data: {
      player1: newPlayer.username,
      player2: existingPlayer.username,
      isAdmin: false,
      move: newPlayer.move,
      lobbyID: curLobby.lobbyID,
      isPrivate: curLobby.isPrivate,
    },
  });
  existingPlayer.sendToClient({
    action: "display-alert",
    data: {
      alert: "success",
      username: newPlayer.username,
      message: `${newPlayer.username} joined the lobby`,
    },
    type: "user-joined",
  });
}

exports.joinLobby = joinLobby;
exports.joinLobbyHelper = joinLobbyHelper;
