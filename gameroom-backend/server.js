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
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Special admin room code
const ADMIN_ROOM_CODE = "676767";

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // ==================== EVENT 1: CREATE ROOM ====================
  socket.on("create_room", async ({ roomCode, gameType }) => {
    console.log(`📝 Creating room: ${roomCode} (${gameType})`);

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
        gameType, // 'challenges' or 'guessing'
        host: socket.id,
        players: [],
        gameStarted: false,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
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

      console.log(`✅ Room created: ${roomCode}`);
    } catch (error) {
      console.error("❌ Error creating room:", error);
      socket.emit("room_created", {
        success: false,
        error: "Failed to create room",
      });
    }
  });

  // ==================== EVENT 2: JOIN ROOM ====================
  socket.on("join_room", async ({ roomCode, playerName }) => {
    console.log(
      `🚪 User joining room: ${roomCode}${playerName ? ` as ${playerName}` : ""}`,
    );

    try {
      // Special handling for admin code
      if (roomCode === ADMIN_ROOM_CODE) {
        let room = await Room.findOne({ roomCode: ADMIN_ROOM_CODE });

        // If admin room doesn't exist, create it as a guessing game
        if (!room) {
          console.log("🔑 Creating admin guessing game room");
          room = new Room({
            roomCode: ADMIN_ROOM_CODE,
            gameType: "guessing",
            host: socket.id,
            players: [],
            gameStarted: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours for admin room
            questions: [],
            currentQuestionIndex: 0,
            phase: 0,
            answers: new Map(),
          });
          await room.save();
        }

        socket.join(roomCode);

        // Add player if they provided a name
        if (playerName) {
          const playerExists = room.players.find((p) => p.name === playerName);

          if (playerExists) {
            socket.emit("room_joined", {
              success: false,
              error: "Player name already taken",
            });
            return;
          }

          room.players.push({ name: playerName, score: 0 });
          await room.save();

          // Notify all users in room about new player
          io.to(roomCode).emit("room_updated", room);
          console.log(`✅ Player ${playerName} joined admin room`);
        }

        socket.emit("room_joined", {
          success: true,
          room,
          roomCode: ADMIN_ROOM_CODE, // Add roomCode at top level
          isHost: room.host === socket.id,
        });

        // Send initial room state
        socket.emit("room_updated", room);
        console.log(
          `✅ User joined admin room as ${room.host === socket.id ? "HOST" : "PLAYER"}`,
        );
        return;
      }

      // Regular room handling
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("room_joined", {
          success: false,
          error: "Room not found",
        });
        return;
      }

      socket.join(roomCode);

      // Add player if they provided a name
      if (playerName) {
        const playerExists = room.players.find((p) => p.name === playerName);

        if (playerExists) {
          socket.emit("room_joined", {
            success: false,
            error: "Player name already taken",
          });
          return;
        }

        room.players.push({ name: playerName, score: 0 });
        await room.save();

        // Notify all users in room about new player
        io.to(roomCode).emit("room_updated", room);
        console.log(`✅ Player ${playerName} joined room ${roomCode}`);
      }

      socket.emit("room_joined", {
        success: true,
        room,
        roomCode: room.roomCode, // Add roomCode at top level
        isHost: room.host === socket.id,
      });

      // Send initial room state
      socket.emit("room_updated", room);
    } catch (error) {
      console.error("❌ Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // ==================== EVENT 3: ADD QUESTION ====================
  socket.on("add_question", async ({ roomCode, question }) => {
    console.log(`➕ Adding question to room ${roomCode}:`, question.text);

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
      console.log(`✅ Question added to room ${roomCode}`);
    } catch (error) {
      console.error("❌ Error adding question:", error);
      socket.emit("error", { message: "Failed to add question" });
    }
  });

  // ==================== EVENT 4: UPDATE QUESTION ====================
  socket.on("update_question", async ({ roomCode, index, question }) => {
    console.log(`✏️ Updating question ${index} in room ${roomCode}`);

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
        console.log(`✅ Question ${index} updated in room ${roomCode}`);
      } else {
        socket.emit("error", { message: "Invalid question index" });
      }
    } catch (error) {
      console.error("❌ Error updating question:", error);
      socket.emit("error", { message: "Failed to update question" });
    }
  });

  // ==================== EVENT 5: START GAME ====================
  socket.on("start_game", async ({ roomCode }) => {
    console.log(`🎮 Starting game in room ${roomCode}`);

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
      room.phase = 1; // Move to phase 1 (present question)
      await room.save();

      io.to(roomCode).emit("room_updated", room);
      console.log(`✅ Game started in room ${roomCode}`);
    } catch (error) {
      console.error("❌ Error starting game:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // ==================== EVENT 6: START PHASE (Change Phase) ====================
  socket.on("start_phase", async ({ roomCode, phase }) => {
    console.log(`🔄 Changing to phase ${phase} in room ${roomCode}`);

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

      // If starting guessing phase (2), set timer and clear answers
      if (phase === 2) {
        room.roundStartedAt = Date.now();
        room.answers = new Map(); // Clear previous answers
        console.log(`⏱️ Starting 30-second timer for room ${roomCode}`);
      }

      await room.save();
      io.to(roomCode).emit("room_updated", room);
      console.log(`✅ Phase changed to ${phase} in room ${roomCode}`);
    } catch (error) {
      console.error("❌ Error changing phase:", error);
      socket.emit("error", { message: "Failed to change phase" });
    }
  });

  // ==================== EVENT 7: SUBMIT GUESS ====================
  socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
    console.log(
      `🎯 Player ${playerName} submitted guess: ${guess} in room ${roomCode}`,
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

      // Check if player already submitted
      if (room.answers.has(playerName)) {
        socket.emit("error", { message: "You have already submitted a guess" });
        return;
      }

      // Store answer
      room.answers.set(playerName, guess);
      await room.save();

      // Check if all players answered
      const allAnswered = room.players.every((p) => room.answers.has(p.name));

      if (allAnswered) {
        console.log(
          `✅ All players answered in room ${roomCode}, auto-advancing to phase 3`,
        );
        room.phase = 3; // Auto-advance to set answer phase
        await room.save();
      }

      io.to(roomCode).emit("room_updated", room);
      console.log(`✅ Guess submitted by ${playerName} in room ${roomCode}`);
    } catch (error) {
      console.error("❌ Error submitting guess:", error);
      socket.emit("error", { message: "Failed to submit guess" });
    }
  });

  // ==================== EVENT 8: SET ANSWER (Calculate Scores) ====================
  socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
    console.log(
      `✅ Setting correct answer: ${correctAnswer} in room ${roomCode}`,
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

      // ========== SCORE CALCULATION ==========
      const currentQuestion = room.questions[room.currentQuestionIndex];
      const maxPoints = 1000;
      const sigma = 0.2;
      const rangeMin = currentQuestion.rangeMin;
      const rangeMax = currentQuestion.rangeMax;
      const maxDistance = rangeMax - rangeMin;

      console.log(`📊 Calculating scores for room ${roomCode}...`);

      for (const player of room.players) {
        const guess = room.answers.get(player.name);

        if (guess !== undefined) {
          const distance = Math.abs(correctAnswer - guess);
          const normalizedDistance = distance / maxDistance;

          // Gaussian scoring formula
          const points =
            maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));

          const roundedPoints = Math.max(0, Math.round(points));
          player.score += roundedPoints;

          console.log(
            `   ${player.name}: guess=${guess}, distance=${distance}, points=+${roundedPoints}, total=${player.score}`,
          );
        }
      }

      room.phase = 4; // Move to leaderboard phase
      await room.save();

      io.to(roomCode).emit("room_updated", room);
      console.log(`✅ Scores calculated and updated for room ${roomCode}`);
    } catch (error) {
      console.error("❌ Error setting answer:", error);
      socket.emit("error", { message: "Failed to set answer" });
    }
  });

  // ==================== EVENT 9: NEXT QUESTION ====================
  socket.on("next_question", async ({ roomCode }) => {
    console.log(`⏭️ Moving to next question in room ${roomCode}`);

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

      // Check if there are more questions
      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex += 1;
        room.phase = 1; // Back to present question phase
        room.answers = new Map(); // Clear answers
        room.correctAnswer = null;
        console.log(
          `✅ Moving to question ${room.currentQuestionIndex + 1} in room ${roomCode}`,
        );
      } else {
        // No more questions - game ended
        room.phase = 5; // Game end phase
        console.log(`🏁 Game ended in room ${roomCode}`);
      }

      await room.save();
      io.to(roomCode).emit("room_updated", room);
    } catch (error) {
      console.error("❌ Error moving to next question:", error);
      socket.emit("error", { message: "Failed to move to next question" });
    }
  });

  // ==================== DISCONNECT ====================
  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Optional: Clean up expired rooms periodically (but keep admin room)
setInterval(
  async () => {
    try {
      const result = await Room.deleteMany({
        expiresAt: { $lt: new Date() },
        roomCode: { $ne: ADMIN_ROOM_CODE }, // Don't delete admin room
      });
      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired room(s)`);
      }
    } catch (error) {
      console.error("❌ Error cleaning up rooms:", error);
    }
  },
  60 * 60 * 1000,
); // Every hour

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(
    `🌐 Accepting connections from: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
  console.log(
    `🔑 Admin room code: ${ADMIN_ROOM_CODE} (creates guessing game as host)`,
  );
});
