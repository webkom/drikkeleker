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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("âœ… MongoDB connected"))
  .catch((err) => console.error("âŒ MongoDB error:", err));

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("ðŸ‘¤ User connected:", socket.id);

  // ==================== EVENT 1: CREATE ROOM ====================
  socket.on("create_room", async ({ roomCode, gameType }) => {
    console.log(
      `ðŸ“ Creating room: ${roomCode} (${gameType}) for host ${socket.id}`,
    );

    try {
      const existingRoom = await Room.findOne({ roomCode });

      if (existingRoom) {
        socket.emit("room_created", {
          success: false,
          error: "Room already exists",
        });
        return;
      }

      const newRoom = new Room({
        roomCode,
        gameType,
        host: socket.id,
        players: [],
        gameStarted: false,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        questions: [],
        currentQuestionIndex: 0,
        phase: 0,
        answers: new Map(),
      });

      await newRoom.save();
      socket.join(roomCode);

      socket.emit("room_created", {
        success: true,
        roomCode,
        isHost: true,
      });

      console.log(`âœ… Room ${roomCode} created by host ${socket.id}`);
    } catch (error) {
      console.error("âŒ Error creating room:", error);
      socket.emit("room_created", {
        success: false,
        error: "Failed to create room",
      });
    }
  });

  // ==================== EVENT 2: JOIN ROOM ====================
  socket.on("join_room", async ({ roomCode, playerName }) => {
    console.log(
      `ðŸšª Socket ${socket.id} joining room ${roomCode}${playerName ? ` as player "${playerName}"` : " (checking)"}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("room_joined", {
          success: false,
          error: "Room not found",
        });
        return;
      }

      socket.join(roomCode);

      // Check if this socket is the host
      const isHost = room.host === socket.id;

      if (isHost) {
        // Host is accessing their room
        console.log(`âœ… Host ${socket.id} accessed room ${roomCode}`);

        socket.emit("room_joined", {
          success: true,
          room,
          roomCode: room.roomCode,
          isHost: true,
        });

        // Send room update
        socket.emit("room_updated", room);
      } else if (playerName) {
        // Player joining with name
        const playerExists = room.players.find((p) => p.name === playerName);

        if (playerExists) {
          socket.emit("room_joined", {
            success: false,
            error: "Player name already taken",
          });
          return;
        }

        // Add player to room
        room.players.push({ name: playerName, score: 0 });
        await room.save();

        console.log(`âœ… Player "${playerName}" joined room ${roomCode}`);

        // Notify all users in room
        io.to(roomCode).emit("room_updated", room);

        // Send success response
        socket.emit("room_joined", {
          success: true,
          room,
          roomCode: room.roomCode,
          isHost: false,
          playerName: playerName,
        });
      } else {
        // Just checking if room exists (player hasn't provided name yet)
        console.log(
          `â„¹ï¸ Room ${roomCode} exists, waiting for player name from ${socket.id}`,
        );

        socket.emit("room_exists", {
          roomExists: true,
          roomCode: room.roomCode,
        });

        // Also send basic room info
        socket.emit("room_joined", {
          success: true,
          room,
          roomCode: room.roomCode,
          isHost: false,
        });
      }
    } catch (error) {
      console.error("âŒ Error joining room:", error);
      socket.emit("room_joined", {
        success: false,
        error: "Failed to join room",
      });
    }
  });

  // ==================== EVENT 3: ADD QUESTION ====================
  socket.on("add_question", async ({ roomCode, question }) => {
    console.log(`âž• Host ${socket.id} adding question to room ${roomCode}`);

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can add questions" });
        return;
      }

      room.questions.push(question);
      await room.save();

      io.to(roomCode).emit("room_updated", room);
      console.log(`âœ… Question added to room ${roomCode}`);
    } catch (error) {
      console.error("âŒ Error adding question:", error);
      socket.emit("error", { message: "Failed to add question" });
    }
  });

  // ==================== EVENT 4: UPDATE QUESTION ====================
  socket.on("update_question", async ({ roomCode, index, question }) => {
    console.log(
      `âœï¸ Host ${socket.id} updating question ${index} in room ${roomCode}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can update questions" });
        return;
      }

      if (index >= 0 && index < room.questions.length) {
        room.questions[index] = question;
        await room.save();
        io.to(roomCode).emit("room_updated", room);
        console.log(`âœ… Question ${index} updated in room ${roomCode}`);
      } else {
        socket.emit("error", { message: "Invalid question index" });
      }
    } catch (error) {
      console.error("âŒ Error updating question:", error);
      socket.emit("error", { message: "Failed to update question" });
    }
  });

  // ==================== EVENT 5: START GAME ====================
  socket.on("start_game", async ({ roomCode }) => {
    console.log(`ðŸŽ® Host ${socket.id} starting game in room ${roomCode}`);

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can start game" });
        return;
      }

      if (room.players.length < 2) {
        socket.emit("error", { message: "Need at least 2 players to start" });
        return;
      }

      if (room.questions.length < 1) {
        socket.emit("error", { message: "Need at least 1 question to start" });
        return;
      }

      room.gameStarted = true;
      room.phase = 1;
      await room.save();

      io.to(roomCode).emit("room_updated", room);
      console.log(`âœ… Game started in room ${roomCode}`);
    } catch (error) {
      console.error("âŒ Error starting game:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // ==================== EVENT 6: START PHASE ====================
  socket.on("start_phase", async ({ roomCode, phase }) => {
    console.log(
      `ðŸ”„ Host ${socket.id} changing to phase ${phase} in room ${roomCode}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can change phase" });
        return;
      }

      room.phase = phase;

      if (phase === 2) {
        room.roundStartedAt = Date.now();
        room.answers = new Map();
        console.log(`â±ï¸ Starting 30-second timer for room ${roomCode}`);
      }

      await room.save();
      io.to(roomCode).emit("room_updated", room);
      console.log(`âœ… Phase changed to ${phase} in room ${roomCode}`);
    } catch (error) {
      console.error("âŒ Error changing phase:", error);
      socket.emit("error", { message: "Failed to change phase" });
    }
  });

  // ==================== EVENT 7: SUBMIT GUESS ====================
  socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
    console.log(
      `ðŸŽ¯ Player "${playerName}" submitted guess: ${guess} in room ${roomCode}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.phase !== 2) {
        socket.emit("error", { message: "Not in guessing phase" });
        return;
      }

      const player = room.players.find((p) => p.name === playerName);
      if (!player) {
        socket.emit("error", { message: "Player not found" });
        return;
      }

      if (room.answers.has(playerName)) {
        socket.emit("error", { message: "You have already submitted a guess" });
        return;
      }

      room.answers.set(playerName, guess);
      await room.save();

      const allAnswered = room.players.every((p) => room.answers.has(p.name));

      if (allAnswered) {
        console.log(`âœ… All players answered in room ${roomCode}`);
        room.phase = 3;
        await room.save();
      }

      io.to(roomCode).emit("room_updated", room);
      console.log(`âœ… Guess submitted by "${playerName}" in room ${roomCode}`);
    } catch (error) {
      console.error("âŒ Error submitting guess:", error);
      socket.emit("error", { message: "Failed to submit guess" });
    }
  });

  // ==================== EVENT 8: SET ANSWER ====================
  socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
    console.log(
      `ðŸ“Š Host ${socket.id} setting answer: ${correctAnswer} in room ${roomCode}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can set answer" });
        return;
      }

      room.correctAnswer = correctAnswer;

      // Score calculation
      const currentQuestion = room.questions[room.currentQuestionIndex];
      const maxPoints = 1000;
      const sigma = 0.2;
      const rangeMin = currentQuestion.rangeMin;
      const rangeMax = currentQuestion.rangeMax;
      const maxDistance = rangeMax - rangeMin;

      console.log(`ðŸ“Š Calculating scores for room ${roomCode}...`);

      for (const player of room.players) {
        const guess = room.answers.get(player.name);

        if (guess !== undefined) {
          const distance = Math.abs(correctAnswer - guess);
          const normalizedDistance = distance / maxDistance;
          const points =
            maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));
          const roundedPoints = Math.max(0, Math.round(points));
          player.score += roundedPoints;

          console.log(
            `   ${player.name}: guess=${guess}, points=+${roundedPoints}, total=${player.score}`,
          );
        }
      }

      room.phase = 4;
      await room.save();

      io.to(roomCode).emit("room_updated", room);
      console.log(`âœ… Scores calculated for room ${roomCode}`);
    } catch (error) {
      console.error("âŒ Error setting answer:", error);
      socket.emit("error", { message: "Failed to set answer" });
    }
  });

  // ==================== EVENT 9: NEXT QUESTION ====================
  socket.on("next_question", async ({ roomCode }) => {
    console.log(
      `â­ï¸ Host ${socket.id} moving to next question in room ${roomCode}`,
    );

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.host !== socket.id) {
        socket.emit("error", {
          message: "Only host can move to next question",
        });
        return;
      }

      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        room.phase = 1;
        room.answers = new Map();
        room.correctAnswer = null;
        console.log(
          `âœ… Moving to question ${room.currentQuestionIndex + 1} in room ${roomCode}`,
        );
      } else {
        room.phase = 5;
        console.log(`ðŸ Game ended in room ${roomCode}`);
      }

      await room.save();
      io.to(roomCode).emit("room_updated", room);
    } catch (error) {
      console.error("âŒ Error moving to next question:", error);
      socket.emit("error", { message: "Failed to move to next question" });
    }
  });

  // ==================== DISCONNECT ====================
  socket.on("disconnect", () => {
    console.log("ðŸ‘‹ User disconnected:", socket.id);
  });
});

// Clean up expired rooms periodically
setInterval(
  async () => {
    try {
      const result = await Room.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      if (result.deletedCount > 0) {
        console.log(`ðŸ§¹ Cleaned up ${result.deletedCount} expired room(s)`);
      }
    } catch (error) {
      console.error("âŒ Error cleaning up rooms:", error);
    }
  },
  60 * 60 * 1000,
);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`ðŸš€ Server running on port ${PORT}`);
  console.log(`ðŸ“¡ Socket.io ready for connections`);
  console.log(
    `ðŸŒ Accepting connections from: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
});
