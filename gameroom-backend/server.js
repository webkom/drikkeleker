require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

/**
 * Helper function to safely convert a Mongoose Room document to a plain
 * JavaScript object that can be sent over the network as JSON.
 * It crucially converts the `answers` Map into a plain object.
 * @param {import("mongoose").Document} roomDoc The Mongoose document for the room.
 * @returns {object} A client-safe, plain JavaScript object.
 */
function sanitizeRoomForEmit(roomDoc) {
	if (!roomDoc) return null;
	const room = roomDoc.toObject();

	// This is the most critical part: Convert the server-side Map to a client-side object.
	if (room.answers instanceof Map) {
		room.answers = Object.fromEntries(room.answers);
	} else {
		room.answers = {};
	}

	// Ensure other fields have sensible defaults if they don't exist
	room.questions = room.questions || [];
	room.players = room.players || [];

	return room;
}

/**
 * Utility to broadcast the sanitized room state to all clients in that room.
 * @param {import("mongoose").Document} roomDoc
 */
function emitRoomUpdated(roomDoc) {
	if (roomDoc) {
		io.to(roomDoc.roomCode).emit("room_updated", sanitizeRoomForEmit(roomDoc));
	}
}

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("✅ MongoDB connected"))
	.catch((err) => console.error("❌ MongoDB error:", err));

// Socket.io connection handler
io.on("connection", (socket) => {
	console.log("👤 User connected:", socket.id);

	// Log all incoming events for debugging
	socket.onAny((event, ...args) => {
		console.log(`📨 [${socket.id.slice(0, 6)}] Received: ${event}`, JSON.stringify(args).slice(0, 200));
	});

	socket.on("create_room", async ({ roomCode, gameType }) => {
		try {
			if (await Room.findOne({ roomCode })) {
				return socket.emit("room_created", { success: false, error: "Room already exists" });
			}
			const newRoom = new Room({
				roomCode,
				gameType,
				host: socket.id,
				expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
			});
			await newRoom.save();
			socket.join(roomCode);
			socket.emit("room_created", { success: true, roomCode, isHost: true, gameType });
		} catch (error) {
			console.error("❌ Error creating room:", error);
			socket.emit("room_created", { success: false, error: "Failed to create room" });
		}
	});

	socket.on("join_room", async ({ roomCode, playerName }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (!room) {
				return socket.emit("room_joined", { success: false, error: "Room not found" });
			}
			socket.join(roomCode);
			const isHost = room.host === socket.id;

			if (isHost) {
				socket.emit("room_joined", {
					success: true,
					room: sanitizeRoomForEmit(room),
					isHost: true,
					gameType: room.gameType,
					roomCode: room.roomCode
				});
			} else if (playerName) {
				if (!room.players.some((p) => p.name === playerName)) {
					room.players.push({ name: playerName, score: 0 });
					await room.save();
					emitRoomUpdated(room);
				}
				socket.emit("room_joined", {
					success: true,
					room: sanitizeRoomForEmit(room),
					isHost: false,
					playerName,
					gameType: room.gameType,
					roomCode: room.roomCode
				});
			} else {
				socket.emit("room_joined", {
					success: true,
					room: sanitizeRoomForEmit(room),
					isHost: false,
					gameType: room.gameType,
					roomCode: room.roomCode
				});
			}
		} catch (error) {
			console.error("❌ Error joining room:", error);
			socket.emit("room_joined", { success: false, error: "Failed to join room" });
		}
	});

	socket.on("add_question", async ({ roomCode, question }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (room && room.host === socket.id) {
				room.questions.push(question);
				await room.save();
				emitRoomUpdated(room);
			}
		} catch (e) { console.error("Error adding question:", e); }
	});

	socket.on("update_question", async ({ roomCode, index, question }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (room && room.host === socket.id && room.questions[index]) {
				room.questions[index] = question;
				await room.save();
				emitRoomUpdated(room);
			}
		} catch (e) { console.error("Error updating question:", e); }
	});

	socket.on("start_game", async ({ roomCode }) => {
		try {
			const room = await Room.findOne({ roomCode });
			console.log('🎮 START_GAME:', {
				roomCode,
				requesterId: socket.id,
				hostId: room?.host,
				isHost: socket.id === room?.host,
				gameType: room?.gameType,
				playerCount: room?.players?.length,
				questionCount: room?.questions?.length,
				currentPhase: room?.phase
			});

			if (room && room.host === socket.id && room.gameType === "guessing") {
				if (room.players.length < 2 || room.questions.length < 1) {
					console.log('❌ Cannot start game - insufficient players or questions');
					return socket.emit("error", { message: "Cannot start game" });
				}
				room.gameStarted = true;
				room.phase = 1;
				room.correctAnswer = null;
				// FIX: Always treat `answers` as a Map on the server. Reset with `new Map()`.
				room.answers = new Map();
				await room.save();
				emitRoomUpdated(room);
				console.log(`✅ Game started in room ${roomCode}, phase: ${room.phase}`);
			} else {
				console.log('❌ Cannot start game - permission denied or wrong game type');
			}
		} catch (error) {
			console.error("❌ Error starting game:", error);
		}
	});

	socket.on("start_phase", async ({ roomCode, phase }) => {
		try {
			const room = await Room.findOne({ roomCode });
			console.log('🎯 START_PHASE:', {
				roomCode,
				requestedPhase: phase,
				currentPhase: room?.phase,
				requesterId: socket.id,
				hostId: room?.host,
				isHost: socket.id === room?.host
			});

			if (room && room.host === socket.id) {
				room.phase = phase;
				if (phase === 2) {
					room.roundStartedAt = Date.now();
					// FIX: Reset with a new Map.
					room.answers = new Map();
					console.log(`⏱️  Starting guessing round for room ${roomCode}`);
				}
				await room.save();
				emitRoomUpdated(room);
				console.log(`✅ Phase updated to ${phase} in room ${roomCode}`);
			} else {
				console.log('❌ Cannot change phase - permission denied');
			}
		} catch (error) {
			console.error("❌ Error starting phase:", error);
		}
	});

	socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (!room || room.phase !== 2) {
				console.log('❌ Cannot submit guess:', {
					roomCode,
					playerName,
					guess,
					roomExists: !!room,
					currentPhase: room?.phase,
					reason: !room ? 'room not found' : 'not in guessing phase'
				});
				return;
			}

			// FIX: Use Map methods `.has()` and `.set()`.
			if (room.answers.has(playerName)) {
				console.log(`⚠️  Player ${playerName} already submitted guess`);
				return;
			}

			room.answers.set(playerName, guess);
			console.log(`📝 Guess submitted:`, {
				roomCode,
				playerName,
				guess,
				totalAnswers: room.answers.size,
				totalPlayers: room.players.length
			});

			const allAnswered = room.players.every((p) => room.answers.has(p.name));
			if (allAnswered) {
				room.phase = 3;
				console.log(`✅ All players answered! Moving to phase 3`);
			}
			await room.save();
			emitRoomUpdated(room);
		} catch (error) {
			console.error("❌ Error submitting guess:", error);
		}
	});

	socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (!room || room.host !== socket.id) {
				console.log('❌ Cannot set answer - permission denied');
				return;
			}

			room.correctAnswer = correctAnswer;
			const currentQuestion = room.questions[room.currentQuestionIndex];
			const maxPoints = 1000;
			const sigma = 0.2;
			const maxDistance = currentQuestion.rangeMax - currentQuestion.rangeMin;

			console.log(`🎯 Setting correct answer: ${correctAnswer}`);
			console.log(`📊 Calculating scores...`);

			for (const player of room.players) {
				// FIX: Use Map method `.get()`.
				const guess = room.answers.get(player.name);
				if (guess !== undefined) {
					const distance = Math.abs(correctAnswer - guess);
					const normalizedDistance = distance / Math.max(1, maxDistance);
					const points = maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));
					const roundedPoints = Math.round(points);
					player.score += roundedPoints;
					console.log(`  ${player.name}: guessed ${guess}, earned ${roundedPoints} points (total: ${player.score})`);
				} else {
					console.log(`  ${player.name}: no guess submitted`);
				}
			}

			room.phase = 4;
			await room.save();
			emitRoomUpdated(room);
			console.log(`✅ Scores calculated, moving to phase 4 (leaderboard)`);
		} catch (error) {
			console.error("❌ Error setting answer:", error);
		}
	});

	socket.on("next_question", async ({ roomCode }) => {
		try {
			const room = await Room.findOne({ roomCode });
			if (!room || room.host !== socket.id) {
				console.log('❌ Cannot move to next question - permission denied');
				return;
			}

			console.log(`➡️  Next question requested:`, {
				currentIndex: room.currentQuestionIndex,
				totalQuestions: room.questions.length
			});

			if (room.currentQuestionIndex + 1 < room.questions.length) {
				room.currentQuestionIndex += 1;
				room.phase = 1;
				// FIX: Reset with a new Map.
				room.answers = new Map();
				room.correctAnswer = null;
				console.log(`✅ Moving to question ${room.currentQuestionIndex + 1}, phase reset to 1`);
			} else {
				room.phase = 5; // Game End
				console.log(`🏁 Game ended - no more questions`);
			}
			await room.save();
			emitRoomUpdated(room);
		} catch (error) {
			console.error("❌ Error moving to next question:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log("👋 User disconnected:", socket.id);
	});
});

// Clean up expired rooms periodically
setInterval(async () => {
	try {
		const result = await Room.deleteMany({ expiresAt: { $lt: new Date() } });
		if (result.deletedCount > 0) {
			console.log(`🧹 Cleaned up ${result.deletedCount} expired room(s)`);
		}
	} catch (error) {
		console.error("❌ Error cleaning up rooms:", error);
	}
}, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
