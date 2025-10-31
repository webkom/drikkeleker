"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("SocketProvider: useEffect triggered.");

    const newSocket = io(BACKEND_URL);

    setSocket(newSocket);

    const onConnect = () => {
      console.log("✅ Socket connected!", newSocket.id);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("❌ Socket disconnected!");
      setIsConnected(false);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    console.log("SocketProvider: Attaching listeners.");

    return () => {
      console.log(
        "SocketProvider: Cleaning up listeners and disconnecting socket.",
      );
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
