import { io, Socket } from "socket.io-client";

const BACKEND_URL = "https://gw000w0kwoogkg0wo0os40wk.coolify.webkom.dev";
// const BACKEND_URL = "https://localhost:3001"

let socket: Socket | null = null;

export function getGameSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getGameSocket() must be called in a client component");
  }

  if (!socket) {
    socket = io(BACKEND_URL, { autoConnect: true });
    console.log("New socket created:", BACKEND_URL);
  }

  return socket;
}
