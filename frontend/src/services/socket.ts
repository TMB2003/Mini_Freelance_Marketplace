import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'https://mini-freelance-marketplace-taha-balapurwalas-projects.vercel.app';
type HiredEventPayload = {
  gigId?: string;
  gigTitle: string;
};

type AnyEventMap = Record<string, (...args: any[]) => void>;

type ServerToClientEvents = AnyEventMap & {
  hired: (payload: HiredEventPayload) => void;
  'chat:message': (payload: any) => void;
};

type ClientToServerEvents = AnyEventMap & {
  'chat:join': (payload: { gigId: string }, ack?: (res: { ok: boolean; message?: string }) => void) => void;
  'chat:send': (payload: { gigId: string; text: string }, ack?: (res: { ok: boolean; message?: string }) => void) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const SOCKET_URL = API_BASE_URL;

export const getSocket = () => socket;

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
