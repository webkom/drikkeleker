require("dotenv").config();

const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected :D."))
  .catch((err) => console.error("MongoDB connection error:", err));

const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

io.on("connection", (socket) => {
  const { playerId, roomId } = socket.handshake.query;
  if (!playerId || !roomId) return;

  const upperRoomId = roomId.toUpperCase();
  socket.join(upperRoomId);

  const initializeRoom = async () => {
    try {
      let room = await Room.findById(upperRoomId);

      if (!room) {
        console.log(`Player ${playerId} created room: ${upperRoomId}`);
        room = await Room.create({ _id: upperRoomId, hostId: playerId });
        socket.emit("room-created", {
          success: true,
          isHost: true,
          room: { id: room.id, challengeCount: 0, gameStarted: false },
        });
      } else {
        console.log(`Player ${playerId} joined: ${upperRoomId}`);

        room.createdAt = new Date();
        await room.save();
        socket.emit("room-joined", {
          success: true,
          isHost: room.hostId === playerId,
          room: {
            id: room.id,
            challengeCount: room.challenges.length,
            gameStarted: room.gameStarted,
          },
        });
      }
    } catch (err) {
      console.error("Error initializing room:", err);
    }
  };

  initializeRoom();

  socket.on("add-challenge", async ({ challenge }) => {
    try {
      const room = await Room.findByIdAndUpdate(
        upperRoomId,
        {
          $push: { challenges: challenge },
          $set: { createdAt: new Date() },
        },
        { new: true },
      );
      if (room)
        io.to(upperRoomId).emit("challenge-update", {
          count: room.challenges.length,
        });
    } catch (err) {
      console.error("Error adding challenge:", err);
    }
  });

  socket.on("start-game", async () => {
    try {
      const room = await Room.findById(upperRoomId);
      if (room && room.hostId === playerId && room.challenges.length > 0) {
        room.gameStarted = true;
        room.createdAt = new Date();
        await room.save();
        const shuffledChallenges = shuffleArray([...room.challenges]);
        io.to(upperRoomId).emit("game-started", {
          challenges: shuffledChallenges,
        });
      }
    } catch (err) {
      console.error("Error starting game:", err);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
