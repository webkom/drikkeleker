require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");

const registerRoomHandlers = require("./handlers/roomHandlers");
const registerGuessingHandlers = require("./handlers/guessingHandlers");
const registerChallengeHandlers = require("./handlers/challengeHandlers");
const registerAliasHandlers = require("./handlers/aliasHandlers");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGuessingHandlers(io, socket);
  registerChallengeHandlers(io, socket);
  registerAliasHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

setInterval(
  async () => {
    try {
      await Room.deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  },
  60 * 60 * 1000,
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
