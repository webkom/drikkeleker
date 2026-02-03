const Room = require("../models/Room");

module.exports = (io, socket) => {
  const createRoom = async ({ roomCode, gameType }) => {
    try {
      const existingRoom = await Room.findOne({ roomCode });
      if (existingRoom) {
        return socket.emit("room_created", {
          success: false,
          error: "Room already exists",
        });
      }

      const newRoom = new Room({
        roomCode,
        gameType,
        host: socket.id,
        players: [],
        challenges: [],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });

      await newRoom.save();

      socket.join(roomCode);

      socket.emit("room_created", { success: true, roomCode });
      console.log(`Room created: ${roomCode} (${gameType})`);
    } catch (error) {
      console.error("Create Room Error:", error);
      socket.emit("room_created", { success: false, error: "Server error" });
    }
  };

  const joinRoom = async ({ roomCode, playerName }) => {
    try {
      const room = await Room.findOne({ roomCode });

      if (!room) {
        return socket.emit("room_joined", {
          success: false,
          error: "Room not found",
        });
      }

      if (playerName) {
        const playerExists = room.players.find((p) => p.name === playerName);
        if (!playerExists) {
          room.players.push({ name: playerName, score: 0 });
          await room.save();
        }
      }

      socket.join(roomCode);

      socket.emit("room_joined", {
        success: true,
        roomCode: room.roomCode,
        gameType: room.gameType,
        isHost: room.host === socket.id,
        challenges: room.challenges || [],
      });

      console.log(`User ${socket.id} joined room ${roomCode}`);
    } catch (error) {
      console.error("Join Room Error:", error);
      socket.emit("room_joined", { success: false, error: "Server error" });
    }
  };

  socket.on("create_room", createRoom);
  socket.on("join_room", joinRoom);
};
