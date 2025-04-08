const { lobbies } = require("../models/Lobby");
const { lobbyInterval, checkWin } = require("../utils");

module.exports = (ws, data) => {
  if (!ws.lobbyID) return;
  const lobby = lobbies.getLobby(ws.lobbyID);
  if (!lobby.isGameStarted) return;

  const player = lobby.getPlayer(ws.playerID);
  if (lobby.curMove !== player.move) return;

  if (lobby.gameGrid[data.idx] || lobby.gameGrid[data.idx] === undefined) return;

  lobby.totalMoves++;
  lobby.totalTime = 10000;

  lobby.gameGrid[data.idx] = lobby.curMove;
  lobby.curMove = lobby.curMove === "X" ? "O" : "X";

  if (lobby.intervalID) {
    clearInterval(lobby.intervalID);
  }

  let result = null;

  if (lobby.totalMoves > 4) result = checkWin(lobby.gameGrid);

  lobby.players.forEach((pl) => {
    if (result) {
      result.state =
        result.state === "draw"
          ? "draw"
          : result.state === pl.move || result.state === "loss"
          ? "win"
          : "loss";
      pl.move = pl.move === "X" ? "O" : "X";
    }

    pl.sendToClient({
      action: "update-game",
      data: {
        game: {
          grid: lobby.gameGrid,
          curMove: lobby.curMove,
          totalTime: !result ? lobby.totalTime : 3500,
          timeLimit: lobby.timeLimit,
          result: !result ? { state: null, pattern: null } : result,
        },
      },
    });
  });

  if (result) {
    let totalTime = 2400;

    lobby.intervalID = setInterval(() => {
      totalTime -= 800;
      lobby.players.forEach((pl) => {
        pl.sendToClient({
          action: "update-time",
          data: { totalTime: totalTime },
        });

        if (totalTime <= 0) {
          clearInterval(lobby.intervalID);
          pl.sendToClient({
            action: "reset-game",
            data: { move: pl.move },
          });
        }
      });
    }, 800);

    lobby.totalMoves = 0;
    lobby.curMove = "X";
    lobby.isGameStarted = false;
    lobby.gameGrid = [null, null, null, null, null, null, null, null, null];
    lobby.totalTime = 10000;
  } else {
    lobby.intervalID = setInterval(() => {
      lobbyInterval(lobby);
    }, 1000);
  }
};
