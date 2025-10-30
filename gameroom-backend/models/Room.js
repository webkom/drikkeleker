// backend/models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    // Basic room info
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    gameType: {
      type: String,
      enum: ["challenges", "guessing"],
      required: true,
    },

    host: {
      type: String,
      required: true,
    }, // Socket ID of the host

    // Players
    players: [
      {
        name: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Game state
    gameStarted: {
      type: Boolean,
      default: false,
    },

    // ========== GUESSING GAME SPECIFIC FIELDS ==========
    questions: [
      {
        text: {
          type: String,
          required: true,
        },
        rangeMin: {
          type: Number,
          required: true,
        },
        rangeMax: {
          type: Number,
          required: true,
        },
      },
    ],

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    // Phase: 0=lobby-pro, 1=present question, 2=guessing, 3=set answer, 4=leaderboard, 5=game end
    phase: {
      type: Number,
      default: 0,
    },

    // Map of playerName -> their guess (number)
    answers: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },

    correctAnswer: {
      type: Number,
      default: null,
    },

    roundStartedAt: {
      type: Number,
      default: null,
    }, // Timestamp when phase 2 started (for 30-second timer)

    // ========== CHALLENGE GAME SPECIFIC FIELDS ==========
    challenges: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        text: String,
      },
    ],

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true, // Index for efficient cleanup queries
    },
  },
  {
    // Options
    timestamps: true, // Adds createdAt and updatedAt automatically
    minimize: false, // Keep empty objects
  },
);

// Index for finding rooms by code quickly
roomSchema.index({ roomCode: 1 });

// Index for cleanup queries
roomSchema.index({ expiresAt: 1 });

// Virtual for checking if game has ended
roomSchema.virtual("isGameEnded").get(function () {
  return this.phase === 5;
});

// Method to check if all players have answered
roomSchema.methods.allPlayersAnswered = function () {
  return this.players.every((player) => this.answers.has(player.name));
};

// Method to get current question
roomSchema.methods.getCurrentQuestion = function () {
  if (this.questions && this.currentQuestionIndex < this.questions.length) {
    return this.questions[this.currentQuestionIndex];
  }
  return null;
};

// Method to check if there are more questions
roomSchema.methods.hasMoreQuestions = function () {
  return this.currentQuestionIndex + 1 < this.questions.length;
};

// Static method to clean up expired rooms
roomSchema.statics.cleanupExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

// Pre-save hook to validate data
roomSchema.pre("save", function (next) {
  // Ensure questions have valid ranges
  if (this.questions && this.questions.length > 0) {
    for (const question of this.questions) {
      if (question.rangeMin >= question.rangeMax) {
        return next(new Error("Question rangeMin must be less than rangeMax"));
      }
    }
  }

  // Ensure current question index is valid
  if (this.questions && this.currentQuestionIndex >= this.questions.length) {
    this.currentQuestionIndex = this.questions.length - 1;
  }

  next();
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
