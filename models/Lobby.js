class Lobbies {
  constructor() {
    this.lobbies = new Map();
  }
  addLobby(lobbyID, lobbyData) {
    this.lobbies.set(lobbyID, lobbyData);
  }
  getLobby(lobbyID) {
    return this.lobbies.get(lobbyID);
  }
  findLobby(lID) {
    for (const [lobbyID, lobby] of this.lobbies.entries()) {
      if (lobbyID === lID) continue;
      if (lobby.players.length < 2 && !lobby.isPrivate && lobbyID !== lID) {
        return lobby;
      }
    }

    return null;
  }
}

class Lobby {
  constructor(lobbyID) {
    this.isGameStarted = false;
    this.lobbyID = lobbyID;
    this.isPrivate = true;
    this.players = [];
    this.gameGrid = [null, null, null, null, null, null, null, null, null];
    this.curMove = "X";
    this.totalTime = 10000;
    this.timeLimit = 10000;
    this.intervalID = null;
    this.totalMoves = 0;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerID) {
    const playerIdx = this.players.findIndex((player) => player.playerID === playerID);
    return this.players.splice(playerIdx, 1);
  }
  getPlayer(playerID) {
    return this.players.find((player) => player.playerID === playerID);
  }
}

exports.lobbies = new Lobbies();

exports.Lobby = Lobby;
