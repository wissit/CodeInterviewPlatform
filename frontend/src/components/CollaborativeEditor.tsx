import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import type * as Monaco from 'monaco-editor';

interface CollaborativeEditorProps {
    sessionId: string;
    language: string;
    onLanguageChange?: (language: string) => void;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
    sessionId,
    language,
    onLanguageChange,
}) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);

    useEffect(() => {
        if (!editorRef.current) {
            console.log('Editor not ready yet, waiting...');
            return;
        }

        console.log('Setting up Yjs collaboration for session:', sessionId);

        const ydoc = new Y.Doc();
        const yText = ydoc.getText('monaco');

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
        console.log('Connecting to Yjs WebSocket:', wsUrl);

        const wsProvider = new WebsocketProvider(
            wsUrl,
            `yjs-${sessionId}`,  // Room name (no leading slash)
            ydoc
        );

        wsProvider.on('status', (event: any) => {
            console.log('Yjs connection status:', event.status);
            setIsConnected(event.status === 'connected');
        });

        const binding = new MonacoBinding(
            yText,
            editorRef.current.getModel()!,
            new Set([editorRef.current]),
            wsProvider.awareness
        );

        console.log('Yjs binding created successfully');
        setProvider(wsProvider);

        return () => {
            console.log('Cleaning up Yjs connection');
            binding.destroy();
            wsProvider.destroy();
            ydoc.destroy();
        };
    }, [sessionId, isEditorReady]);

    const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor) => {
        console.log('Monaco Editor mounted successfully');
        editorRef.current = editor;
        setIsEditorReady(true);
    };

    return (
        /* Root: fills the parent but uses explicit viewport height to guarantee rendering */
        <div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
            {/* Toolbar - Fixed Height */}
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700 h-10 shrink-0 z-20">
                <div className="flex items-center gap-2">
                    {/* Connection Indicator */}
                    <div
                        className="w-3 h-3 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: isConnected ? '#22c55e' : '#ef4444' }}
                        title={isConnected ? 'Connected to collaboration server' : 'Disconnected'}
                    ></div>
                    <span className="text-sm text-gray-400 font-medium">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    {!isEditorReady && (
                        <span className="text-xs text-yellow-400 ml-2 animate-pulse">(Loading Editor...)</span>
                    )}
                </div>
                {onLanguageChange && (
                    <select
                        className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm hover:bg-gray-600 transition-colors"
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                    </select>
                )}
            </div>

            {/* Editor Area - Fills remaining vertical space */}
            <div className="flex-1 w-full min-h-0 relative">
                {/* Monaco Editor Component - Explicit height to bypass flex issues */}
                <Editor
                    height="calc(100vh - 120px)"
                    width="100%"
                    defaultLanguage="javascript"
                    language={language}
                    theme="vs-dark"
                    defaultValue="// Start coding here..."
                    onMount={handleEditorDidMount}
                    loading={
                        <div className="flex items-center justify-center h-full text-white bg-gray-900">
                            <span className="animate-pulse">Initializing Environment...</span>
                        </div>
                    }
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 24,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        contextmenu: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default CollaborativeEditor;
