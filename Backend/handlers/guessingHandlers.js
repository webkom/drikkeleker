const Room = require("../models/Room");
const { emitRoomUpdated } = require("../utils/helpers");

module.exports = (io, socket) => {
  socket.on("add_question", async ({ roomCode, question }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room && room.gameType === "guessing" && room.host === socket.id) {
        room.questions.push(question);
        await room.save();
        emitRoomUpdated(io, room);
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("update_question", async ({ roomCode, index, question }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (
        room &&
        room.gameType === "guessing" &&
        room.host === socket.id &&
        room.questions[index]
      ) {
        room.questions[index] = question;
        await room.save();
        emitRoomUpdated(io, room);
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("start_game", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });

      if (!room || room.gameType !== "guessing" || room.host !== socket.id)
        return;

      if (room.players.length < 2 || room.questions.length < 1) {
        return socket.emit("error", {
          message: "Cannot start game: need 2+ players and questions.",
        });
      }

      room.gameStarted = true;
      room.phase = 1;
      room.correctAnswer = null;
      room.answers = new Map();

      await room.save();
      emitRoomUpdated(io, room);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("start_phase", async ({ roomCode, phase }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room && room.gameType === "guessing" && room.host === socket.id) {
        room.phase = phase;
        if (phase === 2) {
          room.roundStartedAt = Date.now();
          room.answers = new Map();
        }
        await room.save();
        emitRoomUpdated(io, room);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (
        !room ||
        room.gameType !== "guessing" ||
        room.phase !== 2 ||
        room.answers.has(playerName)
      )
        return;

      room.answers.set(playerName, guess);

      if (room.players.every((p) => room.answers.has(p.name))) {
        room.phase = 3;
      }
      await room.save();
      emitRoomUpdated(io, room);
    } catch (error) {
      console.error(error);
    }
  });

  // Gaussian logic
  socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room || room.gameType !== "guessing" || room.host !== socket.id)
        return;

      room.correctAnswer = correctAnswer;
      const currentQuestion = room.questions[room.currentQuestionIndex];

      const maxPoints = 1000;
      const sigma = 0.2;
      const maxDistance = currentQuestion.rangeMax - currentQuestion.rangeMin;

      for (const player of room.players) {
        const guess = room.answers.get(player.name);
        if (guess !== undefined) {
          const distance = Math.abs(correctAnswer - guess);
          const normalizedDistance = distance / Math.max(1, maxDistance);
          const points =
            maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));
          player.score += Math.round(points);
        }
      }

      room.phase = 4; // Phase 4: Results
      await room.save();
      emitRoomUpdated(io, room);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("next_question", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room || room.gameType !== "guessing" || room.host !== socket.id)
        return;

      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        room.phase = 1;
        room.answers = new Map();
        room.correctAnswer = null;
      } else {
        room.phase = 5;
      }
      await room.save();
      emitRoomUpdated(io, room);
    } catch (error) {
      console.error(error);
    }
  });
};
