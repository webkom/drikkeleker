"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Lobby } from "./Lobby";
import { Room } from "./Room";

export interface RoomState {
  id: string;
  challengeCount: number;
  gameStarted: boolean;
}

const SOCKET_SERVER_URL = "http://localhost:3000";

const GameRoomClient = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = `player_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);
  }, []);

  const connectToRoom = () => {
    if (!roomInput || !playerId) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { playerId, roomId: roomInput },
    });
    setSocket(newSocket);

    const handleRoomSetup = (data: any) => {
      if (data.success) {
        setRoom(data.room);
        setIsHost(data.isHost);
      } else {
        alert(`Error: ${data.error}`);
        newSocket.disconnect();
        setSocket(null);
        setRoom(null);
      }
    };

    newSocket.on("room-created", handleRoomSetup);
    newSocket.on("room-joined", handleRoomSetup);
  };

  if (!room) {
    return (
      <Lobby
        roomInput={roomInput}
        setRoomInput={setRoomInput}
        onEnterRoom={connectToRoom}
      />
    );
  }

  return <Room initialRoomState={room} isHost={isHost} socket={socket!} />;
};

export default GameRoomClient;
