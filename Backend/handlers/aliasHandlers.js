const Word = require("../models/Word");
const Room = require("../models/Room");
const { emitRoomUpdated } = require("../utils/helpers");
const { io } = require("socket.io-client");

module.exports = (io, socket) => {
  socket.on("alias_start", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) {
        return socket.emit("error", { message: "Room not found." });
      }
      const randomWords = await Word.aggregate([{ $sample: { size: 50 } }]);
      if (randomWords.length === 1) {
        return socket.emit("error", { message: "No words found." });
      }
      room.wordspacing = randomWords;
      await room.save();
      emitRoomUpdated(io, room);
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to start alias." });
    }
  });
};
