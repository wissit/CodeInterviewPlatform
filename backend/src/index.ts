import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIO } from './websocket/socket-server';
import { setupYjsServer } from './websocket/yjs-server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Setup WebSocket servers BEFORE adding upgrade handler
const io = setupSocketIO(httpServer);
const yjsWss = setupYjsServer(httpServer);

// Centralized WebSocket upgrade handler
httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;

    console.log('🔌 Upgrade request for:', pathname);

    if (pathname.startsWith('/yjs')) {
        console.log('→ Routing to Yjs WebSocket');
        yjsWss.handleUpgrade(request, socket, head, (ws) => {
            yjsWss.emit('connection', ws, request);
        });
    } else if (pathname.startsWith('/socket.io')) {
        console.log('→ Routing to Socket.io');
        // Socket.io handles its own upgrades internally
    } else {
        console.log('→ Rejecting unknown WebSocket path');
        socket.destroy();
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import sessionRoutes from './routes/session.routes';
import executionRoutes from './routes/execution.routes';

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/profiles', profileRoutes);
app.use('/v1/sessions', sessionRoutes);
app.use('/v1/execute', executionRoutes);

app.get('/v1', (req: Request, res: Response) => {
    res.json({
        message: 'Code Interview Platform API',
        version: '1.0.0'
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with HTTP server (for WebSocket support)
if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`🔌 WebSocket ready for real-time collaboration`);
    });
}

export default app;
