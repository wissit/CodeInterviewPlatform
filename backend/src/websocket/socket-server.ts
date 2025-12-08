import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export const setupSocketIO = (httpServer: HTTPServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    // JWT Authentication Middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.user.userId}`);

        // Join session room
        socket.on('join-session', (sessionId: string) => {
            socket.join(`session:${sessionId}`);
            console.log(`User ${socket.data.user.userId} joined session ${sessionId}`);

            // Broadcast to room that user joined
            socket.to(`session:${sessionId}`).emit('user-joined', {
                userId: socket.data.user.userId,
                name: socket.data.user.name,
            });
        });

        // Leave session room
        socket.on('leave-session', (sessionId: string) => {
            socket.leave(`session:${sessionId}`);
            socket.to(`session:${sessionId}`).emit('user-left', {
                userId: socket.data.user.userId,
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.user.userId}`);
        });
    });

    return io;
};
