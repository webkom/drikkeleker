const sanitizeRoomForEmit = (roomDoc) => {
  if (!roomDoc) return null;
  const room = roomDoc.toObject();

  if (room.answers instanceof Map) {
    room.answers = Object.fromEntries(room.answers);
  } else {
    room.answers = {};
  }

  room.questions = room.questions || [];
  room.players = room.players || [];
  room.challenges = room.challenges || [];

  return room;
};

const emitRoomUpdated = (io, roomDoc) => {
  if (roomDoc) {
    io.to(roomDoc.roomCode).emit("room_updated", sanitizeRoomForEmit(roomDoc));
  }
};

module.exports = { sanitizeRoomForEmit, emitRoomUpdated };
