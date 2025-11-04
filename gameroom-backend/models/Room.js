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
			enum: ["challenges", "guessing"],
			required: true,
		},
		host: {
			type: String, // Socket ID of the host
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
			index: { expires: '2h' } // Alternative to manual cleanup
		},

		// ========== GUESSING GAME SPECIFIC FIELDS ==========
		questions: [
			{
				text: String,
				rangeMin: Number,
				rangeMax: Number,
			},
		],
		currentQuestionIndex: {
			type: Number,
			default: 0,
		},
		// Phase: 1=present question, 2=guessing, 3=set answer, 4=leaderboard, 5=game end
		phase: {
			type: Number,
			default: 0,
		},
		// CRITICAL: Define 'answers' as a Mongoose Map.
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
			type: Number, // Timestamp
			default: null,
		},

		// ========== CHALLENGE GAME SPECIFIC FIELDS ==========
		challenges: [
			{
				text: String,
			},
		],
	},
	{
		timestamps: true, // Adds createdAt and updatedAt
		minimize: false, // Ensures empty objects/maps are saved
	}
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
