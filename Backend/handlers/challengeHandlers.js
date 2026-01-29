const Room = require("../models/Room");

module.exports = (io, socket) => {
  socket.on("add_challenge", async ({ roomCode, challenge }) => {
    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        return socket.emit("error", { message: "Room not found." });
      }

      if (room.gameType !== "challenges") {
        return socket.emit("error", {
          message: "This action is not for this game type.",
        });
      }

      room.challenges.push({ text: challenge });
      await room.save();

      const newChallenge = room.challenges[room.challenges.length - 1];
      const challengeCount = room.challenges.length;

      const payload = {
        challenge: {
          _id: newChallenge._id,
          text: newChallenge.text,
        },
        challengeCount,
      };

      if (room.gameStarted) {
        io.to(roomCode).emit("challenge_added_mid_game", payload);
      } else {
        io.to(roomCode).emit("challenge_added", payload);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to add challenge." });
    }
  });

  socket.on("start_game", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });

      if (!room || room.gameType !== "challenges") return;

      if (room.challenges.length < 1) {
        return socket.emit("error", {
          message: "Need at least 1 challenge to start",
        });
      }

      room.gameStarted = true;
      await room.save();

      const shuffled = [...room.challenges].sort(() => Math.random() - 0.5);

      io.to(roomCode).emit("game_started", {
        gameStarted: true,
        challenges: shuffled.map((c) => ({ _id: c._id, text: c.text })),
      });
    } catch (error) {
      console.error(error);
    }
  });
};
