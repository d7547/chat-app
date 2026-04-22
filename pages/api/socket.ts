import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import type { Socket as NetSocket } from "net";

type SocketServer = HTTPServer & {
  io?: IOServer;
};

type SocketWithIO = NetSocket & {
  server: SocketServer;
};

type NextApiResponseWithSocket = NextApiResponse & {
  socket: SocketWithIO;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on(
        "send_message",
        (message: { sender: string; content: string; timestamp: string }) => {
          io.emit("receive_message", {
            ...message,
            timestamp: new Date().toISOString(),
          });
        }
      );
    });
  }

  res.end();
}
