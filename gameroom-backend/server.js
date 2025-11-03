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

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("✅ MongoDB connected"))
	.catch((err) => console.error("❌ MongoDB error:", err));

// Socket.io connection handler
io.on("connection", (socket) => {
	console.log("👤 User connected:", socket.id);

	// ==================== EVENT 1: CREATE ROOM ====================
	socket.on("create_room", async ({ roomCode, gameType }) => {
		console.log(
			`📝 Creating room: ${roomCode} (${gameType}) for host ${socket.id}`,
		);

		try {
			const existingRoom = await Room.findOne({ roomCode });

			if (existingRoom) {
				socket.emit("room_created", {
					success: false,
					error: "Room already exists",
				});
				return;
			}

			const newRoom = new Room({
				roomCode,
				gameType,
				host: socket.id,
				players: [],
				gameStarted: false,
				expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
				questions: gameType === "guessing" ? [] : undefined,
				challenges: gameType === "challenges" ? [] : undefined,
				currentQuestionIndex: gameType === "guessing" ? 0 : undefined,
				phase: gameType === "guessing" ? 0 : undefined,
				answers: gameType === "guessing" ? new Map() : undefined,
			});

			await newRoom.save();
			socket.join(roomCode);

			socket.emit("room_created", {
				success: true,
				roomCode,
				isHost: true,
				gameType,
			});

			console.log(`✅ Room ${roomCode} (${gameType}) created by host ${socket.id}`);
		} catch (error) {
			console.error("❌ Error creating room:", error);
			socket.emit("room_created", {
				success: false,
				error: "Failed to create room",
			});
		}
	});

	// ==================== EVENT 2: JOIN ROOM ====================
	socket.on("join_room", async ({ roomCode, playerName }) => {
		console.log(
			`👋 Socket ${socket.id} joining room ${roomCode}${playerName ? ` as player "${playerName}"` : " (checking)"}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("room_joined", {
					success: false,
					error: "Room not found",
				});
				return;
			}

			socket.join(roomCode);

			// Check if this socket is the host
			const isHost = room.host === socket.id;

			if (isHost) {
				// Host is accessing their room
				console.log(`👑 Host ${socket.id} accessed room ${roomCode}`);

				socket.emit("room_joined", {
					success: true,
					room,
					roomCode: room.roomCode,
					isHost: true,
					gameType: room.gameType,
					gameStarted: room.gameStarted,
					// For challenges game, send existing challenges
					...(room.gameType === "challenges" && {
						challengeCount: room.challenges?.length || 0,
					}),
				});

				// Send room update
				socket.emit("room_updated", room);

				// For challenges game, send existing challenges
				if (room.gameType === "challenges" && room.challenges) {
					room.challenges.forEach((challenge) => {
						socket.emit("challenge_added", {
							challenge: {
								_id: challenge._id,
								text: challenge.text,
							},
							challengeCount: room.challenges.length,
						});
					});
				}
			} else if (playerName) {
				// Player joining with name (guessing game)
				const playerExists = room.players.find((p) => p.name === playerName);

				if (playerExists) {
					socket.emit("room_joined", {
						success: false,
						error: "Player name already taken",
					});
					return;
				}

				// Add player to room
				room.players.push({ name: playerName, score: 0 });
				await room.save();

				console.log(`✅ Player "${playerName}" joined room ${roomCode}`);

				// Notify all users in room
				io.to(roomCode).emit("room_updated", room);

				// Send success response
				socket.emit("room_joined", {
					success: true,
					room,
					roomCode: room.roomCode,
					isHost: false,
					playerName: playerName,
					gameType: room.gameType,
				});
			} else {
				// Just checking if room exists OR joining challenges game without name
				console.log(
					`🔍 Room ${roomCode} exists, socket ${socket.id} joined`,
				);

				socket.emit("room_exists", {
					roomExists: true,
					roomCode: room.roomCode,
					gameType: room.gameType,
				});

				// Also send basic room info
				socket.emit("room_joined", {
					success: true,
					room,
					roomCode: room.roomCode,
					isHost: false,
					gameType: room.gameType,
					gameStarted: room.gameStarted,
					// For challenges game
					...(room.gameType === "challenges" && {
						challengeCount: room.challenges?.length || 0,
					}),
				});

				// For challenges game, send existing challenges
				if (room.gameType === "challenges" && room.challenges) {
					room.challenges.forEach((challenge) => {
						socket.emit("challenge_added", {
							challenge: {
								_id: challenge._id,
								text: challenge.text,
							},
							challengeCount: room.challenges.length,
						});
					});

					// If game already started, send game_started event
					if (room.gameStarted) {
						socket.emit("game_started", {
							gameStarted: true,
							challenges: room.challenges.map((c) => ({
								_id: c._id,
								text: c.text,
							})),
						});
					}
				}
			}
		} catch (error) {
			console.error("❌ Error joining room:", error);
			socket.emit("room_joined", {
				success: false,
				error: "Failed to join room",
			});
		}
	});

	// ==================== EVENT 3: ADD QUESTION (for guessing game) ====================
	socket.on("add_question", async ({ roomCode, question }) => {
		console.log(`➕ Host ${socket.id} adding question to room ${roomCode}`);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.host !== socket.id) {
				socket.emit("error", { message: "Only host can add questions" });
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			room.questions.push(question);
			await room.save();

			io.to(roomCode).emit("room_updated", room);
			console.log(`✅ Question added to room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error adding question:", error);
			socket.emit("error", { message: "Failed to add question" });
		}
	});

	// ==================== EVENT 4: UPDATE QUESTION (for guessing game) ====================
	socket.on("update_question", async ({ roomCode, index, question }) => {
		console.log(
			`✏️ Host ${socket.id} updating question ${index} in room ${roomCode}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.host !== socket.id) {
				socket.emit("error", { message: "Only host can update questions" });
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			if (index >= 0 && index < room.questions.length) {
				room.questions[index] = question;
				await room.save();
				io.to(roomCode).emit("room_updated", room);
				console.log(`✅ Question ${index} updated in room ${roomCode}`);
			} else {
				socket.emit("error", { message: "Invalid question index" });
			}
		} catch (error) {
			console.error("❌ Error updating question:", error);
			socket.emit("error", { message: "Failed to update question" });
		}
	});

	// ==================== EVENT 5: ADD CHALLENGE (for challenges game) ====================
	socket.on("add_challenge", async ({ roomCode, challenge }) => {
		console.log(`📝 Adding challenge to room ${roomCode}: "${challenge}"`);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.gameType !== "challenges") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			// Add challenge to challenges array
			room.challenges.push({ text: challenge });
			await room.save();

			const newChallenge = room.challenges[room.challenges.length - 1];

			// Emit appropriate event based on game state
			if (room.gameStarted) {
				io.to(roomCode).emit("challenge_added_mid_game", {
					challenge: {
						_id: newChallenge._id,
						text: newChallenge.text,
					},
					challengeCount: room.challenges.length,
				});
			} else {
				io.to(roomCode).emit("challenge_added", {
					challenge: {
						_id: newChallenge._id,
						text: newChallenge.text,
					},
					challengeCount: room.challenges.length,
				});
			}

			console.log(`✅ Challenge added to room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error adding challenge:", error);
			socket.emit("error", { message: "Failed to add challenge" });
		}
	});

	// ==================== EVENT 6: START GAME ====================
	socket.on("start_game", async ({ roomCode }) => {
		console.log(`🎮 Starting game in room ${roomCode}`);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			// Different validation based on game type
			if (room.gameType === "guessing") {
				if (room.host !== socket.id) {
					socket.emit("error", { message: "Only host can start game" });
					return;
				}

				if (room.players.length < 2) {
					socket.emit("error", { message: "Need at least 2 players to start" });
					return;
				}

				if (room.questions.length < 1) {
					socket.emit("error", { message: "Need at least 1 question to start" });
					return;
				}

				room.gameStarted = true;
				room.phase = 1;
				await room.save();

				io.to(roomCode).emit("room_updated", room);
			} else if (room.gameType === "challenges") {
				if (room.challenges.length < 1) {
					socket.emit("error", { message: "Need at least 1 challenge to start" });
					return;
				}

				room.gameStarted = true;
				await room.save();

				// Shuffle challenges
				const shuffled = [...room.challenges].sort(() => Math.random() - 0.5);

				io.to(roomCode).emit("game_started", {
					gameStarted: true,
					challenges: shuffled.map((c) => ({
						_id: c._id,
						text: c.text,
					})),
				});
			}

			console.log(`✅ Game started in room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error starting game:", error);
			socket.emit("error", { message: "Failed to start game" });
		}
	});

	// ==================== EVENT 7: START PHASE (guessing game only) ====================
	socket.on("start_phase", async ({ roomCode, phase }) => {
		console.log(
			`⏱️ Host ${socket.id} changing to phase ${phase} in room ${roomCode}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.host !== socket.id) {
				socket.emit("error", { message: "Only host can change phase" });
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			room.phase = phase;

			if (phase === 2) {
				room.roundStartedAt = Date.now();
				room.answers = new Map();
				console.log(`⏲️ Starting 30-second timer for room ${roomCode}`);
			}

			await room.save();
			io.to(roomCode).emit("room_updated", room);
			console.log(`✅ Phase changed to ${phase} in room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error changing phase:", error);
			socket.emit("error", { message: "Failed to change phase" });
		}
	});

	// ==================== EVENT 8: SUBMIT GUESS (guessing game only) ====================
	socket.on("submit_guess", async ({ roomCode, playerName, guess }) => {
		console.log(
			`🎯 Player "${playerName}" submitted guess: ${guess} in room ${roomCode}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			if (room.phase !== 2) {
				socket.emit("error", { message: "Not in guessing phase" });
				return;
			}

			const player = room.players.find((p) => p.name === playerName);
			if (!player) {
				socket.emit("error", { message: "Player not found" });
				return;
			}

			if (room.answers.has(playerName)) {
				socket.emit("error", { message: "You have already submitted a guess" });
				return;
			}

			room.answers.set(playerName, guess);
			await room.save();

			const allAnswered = room.players.every((p) => room.answers.has(p.name));

			if (allAnswered) {
				console.log(`✅ All players answered in room ${roomCode}`);
				room.phase = 3;
				await room.save();
			}

			io.to(roomCode).emit("room_updated", room);
			console.log(`✅ Guess submitted by "${playerName}" in room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error submitting guess:", error);
			socket.emit("error", { message: "Failed to submit guess" });
		}
	});

	// ==================== EVENT 9: SET ANSWER (guessing game only) ====================
	socket.on("set_answer", async ({ roomCode, correctAnswer }) => {
		console.log(
			`✔️ Host ${socket.id} setting answer: ${correctAnswer} in room ${roomCode}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.host !== socket.id) {
				socket.emit("error", { message: "Only host can set answer" });
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			room.correctAnswer = correctAnswer;

			// Score calculation
			const currentQuestion = room.questions[room.currentQuestionIndex];
			const maxPoints = 1000;
			const sigma = 0.2;
			const rangeMin = currentQuestion.rangeMin;
			const rangeMax = currentQuestion.rangeMax;
			const maxDistance = rangeMax - rangeMin;

			console.log(`📊 Calculating scores for room ${roomCode}...`);

			for (const player of room.players) {
				const guess = room.answers.get(player.name);

				if (guess !== undefined) {
					const distance = Math.abs(correctAnswer - guess);
					const normalizedDistance = distance / maxDistance;
					const points =
						maxPoints * Math.exp(-(normalizedDistance ** 2) / (2 * sigma ** 2));
					const roundedPoints = Math.max(0, Math.round(points));
					player.score += roundedPoints;

					console.log(
						`   ${player.name}: guess=${guess}, points=+${roundedPoints}, total=${player.score}`,
					);
				}
			}

			room.phase = 4;
			await room.save();

			io.to(roomCode).emit("room_updated", room);
			console.log(`✅ Scores calculated for room ${roomCode}`);
		} catch (error) {
			console.error("❌ Error setting answer:", error);
			socket.emit("error", { message: "Failed to set answer" });
		}
	});

	// ==================== EVENT 10: NEXT QUESTION (guessing game only) ====================
	socket.on("next_question", async ({ roomCode }) => {
		console.log(
			`➡️ Host ${socket.id} moving to next question in room ${roomCode}`,
		);

		try {
			const room = await Room.findOne({ roomCode });

			if (!room) {
				socket.emit("error", { message: "Room not found" });
				return;
			}

			if (room.host !== socket.id) {
				socket.emit("error", {
					message: "Only host can move to next question",
				});
				return;
			}

			if (room.gameType !== "guessing") {
				socket.emit("error", { message: "Wrong game type" });
				return;
			}

			if (room.currentQuestionIndex + 1 < room.questions.length) {
				room.currentQuestionIndex += 1;
				room.phase = 1;
				room.answers = new Map();
				room.correctAnswer = null;
				console.log(
					`➡️ Moving to question ${room.currentQuestionIndex + 1} in room ${roomCode}`,
				);
			} else {
				room.phase = 5;
				console.log(`🏁 Game ended in room ${roomCode}`);
			}

			await room.save();
			io.to(roomCode).emit("room_updated", room);
		} catch (error) {
			console.error("❌ Error moving to next question:", error);
			socket.emit("error", { message: "Failed to move to next question" });
		}
	});

	// ==================== DISCONNECT ====================
	socket.on("disconnect", () => {
		console.log("👋 User disconnected:", socket.id);
	});
});

// Clean up expired rooms periodically
setInterval(
	async () => {
		try {
			const result = await Room.deleteMany({
				expiresAt: { $lt: new Date() },
			});
			if (result.deletedCount > 0) {
				console.log(`🧹 Cleaned up ${result.deletedCount} expired room(s)`);
			}
		} catch (error) {
			console.error("❌ Error cleaning up rooms:", error);
		}
	},
	60 * 60 * 1000,
);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`🔌 Socket.io ready for connections`);
	console.log(
		`🌐 Accepting connections from: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
	);
});
