const Room = require("../models/Room");
const Word = require("../models/Word");

module.exports = (io, socket) => {
  const startAliasGame = async ({ roomCode }) => {};

  const handleSwipe = async ({ roomCode, success, timeTaken }) => {};

  socket.on("alias_start_game", startAliasGame);
  socket.on("alias_swipe", handleSwipe);
};
