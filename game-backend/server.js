// server.js - FINAL VERSION with Cleanup and Card Stack Logic

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = socketIo(server, {
    cors: {origin: "*", methods: ["GET", "POST"]}
});

const rooms = {};

// Helper function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function createRoomData(roomId, hostPlayerId) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            id: roomId,
            hostId: hostPlayerId,
            players: {},
            challenges: [],
            gameStarted: false,
        };
    }
    return rooms[roomId];
}

io.on('connection', (socket) => {
    const {playerId, roomId} = socket.handshake.query;
    if (!playerId || !roomId) return;

    const upperRoomId = roomId.toUpperCase();


    socket.playerId = playerId;
    socket.roomId = upperRoomId;

    if (!rooms[upperRoomId]) {
        console.log(`Player ${playerId} is creating room ${upperRoomId}`);
        const room = createRoomData(upperRoomId, playerId);
        socket.join(upperRoomId);
        room.players[playerId] = {id: playerId};

        socket.emit('room-created', {
            success: true,
            isHost: true,
            room: {id: room.id, challengeCount: room.challenges.length, gameStarted: room.gameStarted}
        });
    } else {
        console.log(`Player ${playerId} is joining room ${upperRoomId}`);
        const room = rooms[upperRoomId];
        socket.join(upperRoomId);
        room.players[playerId] = {id: playerId};

        socket.emit('room-joined', {
            success: true,
            isHost: room.hostId === playerId,
            room: {id: room.id, challengeCount: room.challenges.length, gameStarted: room.gameStarted}
        });
    }

    socket.on('add-challenge', ({challenge}) => {
        const room = rooms[upperRoomId];
        if (room && challenge) {
            room.challenges.push(challenge);
            io.to(upperRoomId).emit('challenge-update', {count: room.challenges.length});
        }
    });

    socket.on('start-game', () => {
        const room = rooms[upperRoomId];
        if (room && room.hostId === playerId && room.challenges.length > 0) {
            room.gameStarted = true;

            const shuffledChallenges = shuffleArray([...room.challenges]);
            io.to(upperRoomId).emit('game-started', {challenges: shuffledChallenges});
        }
    });


    socket.on('disconnect', () => {
        console.log(`Player ${socket.playerId} disconnected from room ${socket.roomId}`);
        const room = rooms[socket.roomId];


        if (room) {
            delete room.players[socket.playerId];


            if (Object.keys(room.players).length === 0) {
                console.log(`Room ${socket.roomId} is now empty. Deleting.`);
                delete rooms[socket.roomId];
            }
        }
    });
});

server.listen(PORT, () => console.log(`🎲 Game Room server running on port ${PORT}`));
