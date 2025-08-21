const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const challengeSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  text: { type: String, required: true },
});

const Room = mongoose.model("Room", roomSchema);
const Challenge = mongoose.model("Challenge", challengeSchema);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", async (data) => {
    const { roomCode } = data;
    console.log("Create room request:", roomCode);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

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
        expiresAt,
      });

      await newRoom.save();

      socket.emit("room_created", {
        success: true,
        roomCode,
      });

      console.log("Room created:", roomCode);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("room_created", {
        success: false,
        error: "Failed to create room",
      });
    }
  });

  socket.on("join_room", async (data) => {
    const { roomCode } = data;
    console.log("Join room request:", roomCode);

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("room_joined", {
          success: false,
          error: "Fant ikke rommet, dobbelsjekk koden",
        });
        return;
      }

      socket.join(roomCode);

      const existingChallenges = await Challenge.find({ roomCode });
      const challengeCount = existingChallenges.length;

      socket.emit("room_joined", {
        success: true,
        roomCode,
        challengeCount,
      });

      existingChallenges.forEach((challenge) => {
        socket.emit("challenge_added", {
          challenge: {
            _id: challenge._id,
            text: challenge.text,
            revealed: challenge.revealed,
          },
          challengeCount,
        });
      });

      console.log(
        "User joined room:",
        roomCode,
        "with",
        challengeCount,
        "challenges",
      );
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("room_joined", {
        success: false,
        error: "Failed to join room",
      });
    }
  });

  socket.on("add_challenge", async (data) => {
    const { roomCode, challenge } = data;
    console.log("Add challenge to room:", roomCode, challenge);

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", {
          message: "Fant ikke rommet, dobbelsjekk koden",
        });
        return;
      }

      const newChallenge = new Challenge({
        roomCode,
        text: challenge,
      });

      await newChallenge.save();

      const challengeCount = await Challenge.countDocuments({ roomCode });

      io.to(roomCode).emit("challenge_added", {
        challenge: {
          _id: newChallenge._id,
          text: newChallenge.text,
        },
        challengeCount,
      });

      console.log("Challenge added successfully, total:", challengeCount);
    } catch (error) {
      console.error("Error adding challenge:", error);
      socket.emit("error", { message: "Failed to add challenge" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
