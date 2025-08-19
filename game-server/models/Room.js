const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  hostId: { type: String, required: true },
  gameStarted: { type: Boolean, default: false },
  challenges: [{ type: String }],
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Slettar rommet etter 1 time
});

module.exports = mongoose.model("Room", RoomSchema);
