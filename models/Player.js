const { usernames, getRandomItem } = require("../utils");

class Player {
  constructor(send, playerID, isAdmin, move = "X", username = getRandomItem(usernames)) {
    this.send = send;
    this.playerID = playerID;
    this.isAdmin = isAdmin;
    this.move = move;
    this.username = username;
  }

  sendToClient(data) {
    this.send(JSON.stringify(data));
  }

  changeUsername(username) {
    this.username = username;
  }
}

exports.Player = Player;
