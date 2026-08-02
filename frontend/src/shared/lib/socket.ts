import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const getSocket = (userId?: string): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      query: { userId: userId || '' },
      autoConnect: true,
    });
  }
  return socket as Socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
