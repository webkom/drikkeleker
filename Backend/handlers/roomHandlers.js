const Room = require("../models/Room");
// Move your helper functions to a utils file, or keep them at the top here if they are specific
const { sanitizeRoomForEmit } = require("../utils/helpers");

module.exports = (io, socket) => {
  const createRoom = async ({ roomCode, gameType }) => {
    try {
      // ... Paste your existing create_room logic here ...
      // Replace 'socket.emit' with the local 'socket' variable
    } catch (error) {
      socket.emit("room_created", { success: false, error: "Failed" });
    }
  };

  const joinRoom = async ({ roomCode, playerName }) => {
    // ... Paste your existing join_room logic here ...
  };

  // Map the events to the functions
  socket.on("create_room", createRoom);
  socket.on("join_room", joinRoom);
};
