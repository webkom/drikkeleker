const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  hostId: { type: String, required: true },
  gameStarted: { type: Boolean, default: false },
  challenges: [{ type: String }],
  shuffledChallenges: [{ type: String }],
  currentChallengeIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = mongoose.model("Room", RoomSchema);
