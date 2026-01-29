const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gameType: {
      type: String,
      enum: ["challenges", "guessing", "alias"],
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    players: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
      },
    ],
    gameStarted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "2h" },
    },

    questions: [
      {
        _id: false,
        text: String,
        rangeMin: Number,
        rangeMax: Number,
      },
    ],
    currentQuestionIndex: { type: Number, default: 0 },
    phase: { type: Number, default: 0 },
    answers: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
    correctAnswer: { type: Number, default: null },
    roundStartedAt: { type: Number, default: null },

    challenges: [
      {
        _id: false,
        text: String,
      },
    ],

    aliasTeams: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        members: [String],
      },
    ],
    aliasTurn: {
      teamIndex: { type: Number, default: 0 },
      startTime: { type: Number, default: null },
      activeWord: { type: String, default: null },
    },
    aliasPlayedWordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Word" }],
    aliasSettings: {
      roundDuration: { type: Number, default: 60 },
      winScore: { type: Number, default: 30 },
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
