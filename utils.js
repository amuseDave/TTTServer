function checkWin(grid) {
  // Define all winning combinations (indices of the 3x3 grid)
  const winConditions = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
  ];

  // Check each winning condition
  for (let i = 0; i < winConditions.length; i++) {
    const [a, b, c] = winConditions[i];
    if (grid[a] !== null && grid[a] === grid[b] && grid[b] === grid[c]) {
      return { state: grid[a], pattern: i };
    }
  }

  // Check if the game is a draw (no null values left and no winner)
  if (!grid.includes(null)) {
    return { state: "draw", pattern: null };
  }

  // Game is not finished yet
  return null;
}

exports.getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

exports.usernames = [
  "NeonXMaster",
  "TicTacGlow",
  "BrightOBlaster",
  "GridNeonNinja",
  "TicToeSpark",
  "LuminousXKing",
  "NeonOTron",
  "GlowGridGuru",
  "TicTacFlash",
  "RadiantXBandit",
  "PulseTicLord",
  "NeonGridWiz",
  "XOGlowPhantom",
  "TicTacBlaze",
  "ShineOStriker",
  "VividXChamp",
  "GlowTicVoyage",
  "NeonEdgeRuler",
  "TicToeFlicker",
  "BrightGridAce",
];

exports.lobbyInterval = (lobby) => {
  lobby.totalTime -= 1000;

  // Skip the turn
  if (lobby.totalTime <= 0) {
    lobby.totalMoves++;
    lobby.totalTime = 10000;
    const gridIdx = lobby.gameGrid.reduce((acc, val, idx) => {
      if (!val) acc.push(idx);
      return acc;
    }, []);

    const randomIdx = gridIdx[Math.floor(Math.random() * gridIdx.length)];
    lobby.gameGrid[randomIdx] = lobby.curMove;
    lobby.curMove = lobby.curMove === "X" ? "O" : "X";

    let result = null;
    if (lobby.totalMoves > 4) result = checkWin(lobby.gameGrid);

    lobby.players.forEach((pl) => {
      const player = `${pl.move !== lobby.curMove ? "You" : pl.username}`;
      let message = `${player} Exceeded Time Limit - Random Move Selected!`;
      if (result) {
        result.state =
          result.state === "draw"
            ? "draw"
            : result.state === pl.move || result.state === "loss"
            ? "win"
            : !result
            ? null
            : "loss";
        pl.move = pl.move === "X" ? "O" : "X";
        setTimeout(() => {
          pl.sendToClient({ action: "switch-moves", data: { move: pl.move } });
        }, 1000);
      }

      pl.sendToClient({
        action: "skip-turn",
        data: {
          game: {
            grid: lobby.gameGrid,
            curMove: lobby.curMove,
            totalTime: !result ? lobby.totalTime : 3500,
            timeLimit: lobby.timeLimit,
            result: !result ? { state: null, pattern: null } : result,
          },
          message,
        },
      });
    });

    if (result) {
      clearInterval(lobby.intervalID);

      let totalTime = 3500;

      lobby.intervalID = setInterval(() => {
        totalTime -= 700;
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
      }, 700);

      lobby.totalMoves = 0;
      lobby.curMove = "X";
      lobby.isGameStarted = false;
      lobby.gameGrid = [null, null, null, null, null, null, null, null, null];
      lobby.totalTime = 10000;
    }
  }
  // Update total time to client
  else {
    lobby.players.forEach((pl) => {
      pl.sendToClient({
        action: "update-time",
        data: { totalTime: lobby.totalTime },
      });
    });
  }
};
exports.checkWin = checkWin;
