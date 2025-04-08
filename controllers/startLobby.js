const { v4: uuidv4 } = require("uuid");
const { Lobby, lobbies } = require("../models/Lobby");
const { Player } = require("../models/Player");

module.exports = (ws, data) => {
  if (ws.lobbyID) return;

  let username;
  let move = "X";
  if (
    typeof data?.username === "string" &&
    data?.username.trim().length > 2 &&
    data?.username.trim().length < 16
  ) {
    username = data?.username;
  }
  if (data?.move === "O") move = data?.move;

  const player = new Player(ws.send.bind(ws), uuidv4(), true, move, username);
  const lobby = new Lobby(uuidv4());

  const playerID = player.playerID;
  const isAdmin = player.isAdmin;
  const lobbyID = lobby.lobbyID;

  lobby.addPlayer(player);
  lobbies.addLobby(lobbyID, lobby);

  ws.lobbyID = lobbyID;
  ws.playerID = playerID;
  ws.isAdmin = isAdmin;

  player.sendToClient({
    action: "start-lobby",
    data: {
      lobbyID,
      player1: player.username,
      player2: null,
      isAdmin: true,
      move,
      isPrivate: true,
    },
  });
};
