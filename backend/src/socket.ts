import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import { Types } from 'mongoose';
import { Gig } from './model/gig.js';
import { ChatMessage } from './model/chatMessage.js';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer) => {
  const origin = process.env['FRONTEND_URL'] ?? '*';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin,
      credentials: true,
    },
  });

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const authHeader = socket.handshake.headers.authorization;
    const headerToken =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : undefined;

    const token =
      (typeof socket.handshake.auth?.['token'] === 'string' ? socket.handshake.auth['token'] : undefined) ?? headerToken;

    if (!token) {
      return next(new Error('Not authenticated'));
    }

    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      return next(new Error('JWT secret not configured'));
    }

    try {
      const decoded = jwt.verify(token, secret) as { id?: string };
      if (!decoded.id) {
        return next(new Error('Invalid token'));
      }

      (socket.data as { userId?: string }).userId = decoded.id;
      socket.join(`user:${decoded.id}`);
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket.data as { userId?: string }).userId;
    if (!userId) return;

    socket.on(
      'chat:join',
      async (payload: { gigId: string }, ack?: (res: { ok: boolean; message?: string }) => void) => {
        try {
          const gigId = payload?.gigId;
          if (!gigId || !Types.ObjectId.isValid(gigId)) {
            ack?.({ ok: false, message: 'Invalid gig ID' });
            return;
          }

          const gig = await Gig.findById(gigId).lean();
          if (!gig) {
            ack?.({ ok: false, message: 'Gig not found' });
            return;
          }

          const ownerId = gig.ownerId.toString();
          const hiredId = gig.hiredFreelancerId?.toString();

          if (gig.status !== 'assigned' || !hiredId) {
            ack?.({ ok: false, message: 'Gig not available for chat' });
            return;
          }

          if (ownerId !== userId && hiredId !== userId) {
            ack?.({ ok: false, message: 'Not authorized' });
            return;
          }

          socket.join(`gig:${gigId}`);
          ack?.({ ok: true });
        } catch {
          ack?.({ ok: false, message: 'Failed to join chat' });
        }
      },
    );

    socket.on(
      'chat:send',
      async (
        payload: { gigId: string; text: string },
        ack?: (res: { ok: boolean; message?: string }) => void,
      ) => {
        try {
          const gigId = payload?.gigId;
          const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

          if (!gigId || !Types.ObjectId.isValid(gigId)) {
            ack?.({ ok: false, message: 'Invalid gig ID' });
            return;
          }
          if (!text) {
            ack?.({ ok: false, message: 'Message is required' });
            return;
          }

          const gig = await Gig.findById(gigId);
          if (!gig) {
            ack?.({ ok: false, message: 'Gig not found' });
            return;
          }

          const ownerId = gig.ownerId.toString();
          const hiredId = gig.hiredFreelancerId?.toString();

          if (gig.status !== 'assigned' || !hiredId) {
            ack?.({ ok: false, message: 'Gig not available for chat' });
            return;
          }

          if (ownerId !== userId && hiredId !== userId) {
            ack?.({ ok: false, message: 'Not authorized' });
            return;
          }

          const msg = await ChatMessage.create({
            gigId: new Types.ObjectId(gigId),
            senderId: new Types.ObjectId(userId),
            text,
          });

          const populated = await ChatMessage.findById(msg._id).populate('senderId', 'name email').lean();

          const outgoing = populated
            ? {
                ...(populated as any),
                gigId: typeof (populated as any).gigId === 'string' ? (populated as any).gigId : (populated as any).gigId?.toString?.(),
              }
            : populated;

          io?.to(`gig:${gigId}`).emit('chat:message', outgoing);
          ack?.({ ok: true });
        } catch {
          ack?.({ ok: false, message: 'Failed to send message' });
        }
      },
    );
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
