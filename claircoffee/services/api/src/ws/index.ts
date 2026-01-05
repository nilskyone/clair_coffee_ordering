import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", (data: { branchId: number }) => {
      socket.join(`branch:${data.branchId}`);
    });
  });
}

export function emitBranchEvent(branchId: number, event: string, payload: unknown) {
  if (!io) {
    return;
  }
  io.to(`branch:${branchId}`).emit(event, payload);
}
