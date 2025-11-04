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
			index: { expires: '2h' }
		},

		// ========== GUESSING GAME SPECIFIC FIELDS ==========
		questions: [
			{
				_id: false, // Don't add _id to subdocuments
				text: String,
				rangeMin: Number,
				rangeMax: Number,
			},
		],
		currentQuestionIndex: {
			type: Number,
			default: 0,
		},
		phase: {
			type: Number,
			default: 0,
		},
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
		},

		// ========== CHALLENGE GAME SPECIFIC FIELDS ==========
		challenges: [
			{
				_id: false, // Don't add _id to subdocuments
				text: String,
			},
		],
	},
	{
		timestamps: true,
		minimize: false,
	}
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
