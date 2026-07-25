import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  if (!socket) {
    const socketServerUrl = (import.meta as any).env?.VITE_SOCKET_URL || '/';
    socket = io(socketServerUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });
  }
  return socket;
};
