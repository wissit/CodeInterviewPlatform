declare module 'y-websocket/bin/utils' {
    import { WebSocket, IncomingMessage } from 'ws';
    import { Doc } from 'yjs';

    export function setupWSConnection(
        conn: WebSocket,
        req: IncomingMessage,
        options?: {
            docName?: string;
            gc?: boolean;
        }
    ): void;
}
