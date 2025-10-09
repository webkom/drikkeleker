const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {})
  .catch((err) => {});

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  gameStarted: { type: Boolean, default: false },
});

const challengeSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  text: { type: String, required: true },
});

const Room = mongoose.model("Room", roomSchema);
const Challenge = mongoose.model("Challenge", challengeSchema);

const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

io.on("connection", (socket) => {
  socket.on("create_room", async (data) => {
    const { roomCode } = data;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    try {
      const existingRoom = await Room.findOne({ roomCode });

      if (existingRoom) {
        socket.emit("room_created", {
          success: false,
          error: "Rom eksisterer allerde",
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
    } catch (error) {
      socket.emit("room_created", {
        success: false,
        error: "Kunne ikke lage rom",
      });
    }
  });

  socket.on("join_room", async (data) => {
    const { roomCode } = data;

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
        gameStarted: room.gameStarted,
      });

      if (room.gameStarted) {
        socket.emit("game_started", {
          gameStarted: true,
          challenges: existingChallenges.map((c) => ({
            _id: c._id,
            text: c.text,
          })),
        });
      } else {
        existingChallenges.forEach((challenge) => {
          socket.emit("challenge_added", {
            challenge: {
              _id: challenge._id,
              text: challenge.text,
            },
            challengeCount,
          });
        });
      }
    } catch (error) {
      socket.emit("room_joined", {
        success: false,
        error: "Klarte ikke å bli med i rom",
      });
    }
  });

  socket.on("add_challenge", async (data) => {
    const { roomCode, challenge } = data;

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

      if (room.gameStarted) {
        io.to(roomCode).emit("challenge_added_mid_game", {
          challenge: {
            _id: newChallenge._id,
            text: newChallenge.text,
          },
          challengeCount,
        });
      } else {
        io.to(roomCode).emit("challenge_added", {
          challenge: {
            _id: newChallenge._id,
            text: newChallenge.text,
          },
          challengeCount,
        });
      }
    } catch (error) {
      socket.emit("error", { message: "Klarte ikke å legge til utfordring" });
    }
  });

  socket.on("start_game", async (data) => {
    const { roomCode } = data;

    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      room.gameStarted = true;
      await room.save();

      const challenges = await Challenge.find({ roomCode });
      const shuffledChallenges = shuffle(challenges);

      io.to(roomCode).emit("game_started", {
        gameStarted: true,
        challenges: shuffledChallenges.map((c) => ({
          _id: c._id,
          text: c.text,
        })),
      });
    } catch (error) {
      socket.emit("error", { message: "Kunne ikke starte spillet" });
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {});
