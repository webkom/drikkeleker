require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

function sanitizeRoomForEmit(roomDoc) {
  if (!roomDoc) return null;
  const room = roomDoc.toObject();

  if (room.answers instanceof Map) {
    room.answers = Object.fromEntries(room.answers);
  } else {
    room.answers = {};
  }

  room.questions = room.questions || [];
  room.players = room.players || [];
  // Also ensure challenges array exists for the default game
  room.challenges = room.challenges || [];

  return room;
}

function emitRoomUpdated(roomDoc) {
  if (roomDoc) {
    io.to(roomDoc.roomCode).emit("room_updated", sanitizeRoomForEmit(roomDoc));
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {})
  .catch((err) => {});

io.on("connection", (socket) => {
  socket.on("create_room", async ({ roomCode, gameType }) => {
    try {
      if (await Room.findOne({ roomCode })) {
        return socket.emit("room_created", {
          success: false,
          error: "Room already exists",
        });
      }
      const newRoom = new Room({
        roomCode,
        gameType,
        host: socket.id,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      await newRoom.save();
      socket.join(roomCode);
      socket.emit("room_created", {
        success: true,
        roomCode,
        isHost: true,
        gameType,
      });
    } catch (error) {
      socket.emit("room_created", {
        success: false,
        error: "Failed to create room",
      });
    }
  });

  socket.on("join_room", async ({ roomCode, playerName }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) {
        return socket.emit("room_joined", {
          success: false,
          error: "Room not found",
        });
      }
      socket.join(roomCode);
      const isHost = room.host === socket.id;

      const payload = {
        success: true,
        room: sanitizeRoomForEmit(room),
        isHost,
        gameType: room.gameType,
        roomCode: room.roomCode,
        ...(playerName && { playerName }),
      };

      if (
        room.gameType === "guessing" &&
        !isHost &&
        playerName &&
        !room.players.some((p) => p.name === playerName)
      ) {
        room.players.push({ name: playerName, score: 0 });
        await room.save();
        emitRoomUpdated(room);
        payload.room = sanitizeRoomForEmit(room);
      }

      socket.emit("room_joined", payload);

      // Special handling for default game: send existing challenges one by one
      if (room.gameType === "challenges") {
        room.challenges.forEach((challenge) => {
          socket.emit("challenge_added", {
            challenge: { _id: challenge._id, text: challenge.text },
            challengeCount: room.challenges.length,
          });
        });
        if (room.gameStarted) {
          socket.emit("game_started", {
            gameStarted: true,
            challenges: room.challenges.map((c) => ({
              _id: c._id,
              text: c.text,
            })),
          });
        }
      }
    } catch (error) {
      socket.emit("room_joined", {
        success: false,
        error: "Failed to join room",
      });
    }
  });

  // ==================== THIS IS THE FIX ====================
  // This handler for the "Default Game" was missing.
  socket.on("add_challenge", async ({ roomCode, challenge }) => {
    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        return socket.emit("error", { message: "Room not found." });
      }

      // Ensure this logic only runs for the "challenges" game type
      if (room.gameType !== "challenges") {
        return socket.emit("error", {
          message: "This action is not for this game type.",
        });
      }

      // Add the new challenge to the room's challenges array
      room.challenges.push({ text: challenge });
      await room.save();

      // Get the newly added challenge (it's the last one in the array)
      const newChallenge = room.challenges[room.challenges.length - 1];
      const challengeCount = room.challenges.length;

      // Prepare the payload that the frontend expects
      const payload = {
        challenge: {
          _id: newChallenge._id, // Mongoose adds an _id automatically
          text: newChallenge.text,
        },
        challengeCount,
      };

      // Emit the correct event back to all clients in the room
      if (room.gameStarted) {
        io.to(roomCode).emit("challenge_added_mid_game", payload);
      } else {
        io.to(roomCode).emit("challenge_added", payload);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to add challenge." });
    }
  });
  // =========================================================

  socket.on("add_question", async ({ roomCode, question }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room && room.host === socket.id) {
        room.questions.push(question);
        await room.save();
        emitRoomUpdated(room);
      }
    } catch (e) {
      /* silent fail */
    }
  });

  socket.on("update_question", async ({ roomCode, index, question }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room && room.host === socket.id && room.questions[index]) {
        room.questions[index] = question;
        await room.save();
        emitRoomUpdated(room);
      }
    } catch (e) {
      /* silent fail */
    }
  });

  socket.on("start_game", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      // Logic for "guessing" game
      if (room.gameType === "guessing" && room.host === socket.id) {
        if (room.players.length < 2 || room.questions.length < 1) {
          return socket.emit("error", { message: "Cannot start game" });
        }
        room.gameStarted = true;
        room.phase = 1;
        room.correctAnswer = null;
        room.answers = new Map();
        await room.save();
        emitRoomUpdated(room);
      }
      // Logic for "challenges" game
      else if (room.gameType === "challenges") {
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
      }
    } catch (error) {
      /* silent fail */
    }
  });

  socket.on("start_phase", async ({ roomCode, phase }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room && room.host === socket.id) {
        room.phase = phase;
        if (phase === 2) {
          room.roundStartedAt = Date.now();
          room.answers = new Map();
        }
        await room.save();
        emitRoomUpdated(room);
      }
    } catch (error) {
      /* silent fail */
    }
  });

  socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room || room.phase !== 2 || room.answers.has(playerName)) return;

      room.answers.set(playerName, guess);

      if (room.players.every((p) => room.answers.has(p.name))) {
        room.phase = 3;
      }
      await room.save();
      emitRoomUpdated(room);
    } catch (error) {
      /* silent fail */
    }
  });

  socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room || room.host !== socket.id) return;

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

      room.phase = 4;
      await room.save();
      emitRoomUpdated(room);
    } catch (error) {
      /* silent fail */
    }
  });

  socket.on("next_question", async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (!room || room.host !== socket.id) return;

      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        room.phase = 1;
        room.answers = new Map();
        room.correctAnswer = null;
      } else {
        room.phase = 5;
      }
      await room.save();
      emitRoomUpdated(room);
    } catch (error) {
      /* silent fail */
    }
  });
});

// Clean up expired rooms periodically
setInterval(
  async () => {
    try {
      await Room.deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (error) {
      /* silent fail */
    }
  },
  60 * 60 * 1000,
);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {});
