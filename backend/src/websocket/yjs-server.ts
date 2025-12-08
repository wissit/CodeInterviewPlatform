/// <reference path="../types/y-websocket.d.ts" />
import { WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';
import prisma from '../utils/prisma';

const docs = new Map<string, Y.Doc>();

export const setupYjsServer = (httpServer: HTTPServer) => {
    const wss = new WebSocketServer({
        noServer: true,
    });

    // Connection handler (will be triggered by centralized upgrade handler in index.ts)
    wss.on('connection', (conn, req) => {
        console.log('===== YJS CONNECTION EVENT FIRED =====');
        const url = new URL(req.url!, `http://${req.headers.host}`);

        // Extract sessionId from path: /yjs-[sessionId]
        const pathname = url.pathname;
        const sessionId = pathname.replace('/yjs-', '');

        console.log('Yjs WebSocket connection for session:', sessionId);

        if (!sessionId || sessionId === pathname) {
            console.error('Invalid session ID in WebSocket path');
            conn.close();
            return;
        }

        // Get or create Y.Doc for this session
        let doc = docs.get(sessionId);
        if (!doc) {
            doc = new Y.Doc();
            docs.set(sessionId, doc);

            // Load existing code from database
            loadSessionCode(sessionId, doc);

            // Save code updates to database
            doc.on('update', () => {
                saveSessionCode(sessionId, doc!);
            });
        }

        setupWSConnection(conn, req, { docName: sessionId, gc: true });
    });

    return wss;
};

async function loadSessionCode(sessionId: string, doc: Y.Doc) {
    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            select: { currentCode: true, language: true },
        });

        if (session?.currentCode) {
            const yText = doc.getText('monaco');
            yText.insert(0, session.currentCode);
        }
    } catch (error) {
        console.error('Error loading session code:', error);
    }
}

async function saveSessionCode(sessionId: string, doc: Y.Doc) {
    try {
        const yText = doc.getText('monaco');
        const code = yText.toString();

        await prisma.session.update({
            where: { id: sessionId },
            data: { currentCode: code },
        });
    } catch (error) {
        console.error('Error saving session code:', error);
    }
}
