import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { CryptoServer } from '../security/cryptoServer';

let io: SocketIOServer | null = null;
const userSocketMap: Map<string, string> = new Map(); // userId -> socketId

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (token) {
      try {
        const decoded: any = CryptoServer.verifyAccessToken(token as string);
        if (decoded?.userId) {
          userSocketMap.set(decoded.userId, socket.id);
          socket.join(`user_${decoded.userId}`);
          console.log(`[Socket.IO] User Connected: ${decoded.userId} (${socket.id})`);
        }
      } catch (err) {
        console.warn(`[Socket.IO] Unauthorized connection attempt`);
      }
    }

    socket.on('disconnect', () => {
      for (const [userId, sId] of userSocketMap.entries()) {
        if (sId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const emitToUser = (userId: string, event: string, payload: any) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};
