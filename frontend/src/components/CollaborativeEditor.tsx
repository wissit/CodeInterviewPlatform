import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import type * as Monaco from 'monaco-editor';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

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
    const [executionOutput, setExecutionOutput] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleRunCode = async () => {
        if (!editorRef.current) return;

        setIsExecuting(true);
        setExecutionOutput('Running...');

        try {
            const content = editorRef.current.getValue();
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/execute`, {
                language,
                version: '*', // Let backend decide or Piston default
                content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { run } = response.data;
            setExecutionOutput(run.output || 'No output');
        } catch (error: any) {
            console.error('Execution failed:', error);
            setExecutionOutput(`Error: ${error.response?.data?.details || error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

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

    // Update language when prop changes
    useEffect(() => {
        if (editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                console.log(`Switching editor language to: ${language}`);
                // Ensure monaco is available (it should be since editorRef is set)
                // We access the global 'monaco' via window or import if needed, but the editor instance allows accessing the model.
                // Actually, correct way via instance is usually just setting it on model.
                // But we need the monaco instance to call setModelLanguage.
                // We can get it from the editor instance if we didn't save it.
                // OR we can rely on the Editor component to do it, but Yjs might be interfering.
                const monaco = (window as any).monaco;
                if (monaco) {
                    monaco.editor.setModelLanguage(model, language);
                }
            }
        }
    }, [language, isEditorReady]);

    const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor) => {
        console.log('Monaco Editor mounted successfully');
        editorRef.current = editor;
        setIsEditorReady(true);
    };

    return (
        /* Root: Explicit height calculation to guarantee space for children */
        <div
            className="flex flex-col bg-gray-900 overflow-hidden w-full"
            style={{ height: 'calc(100vh - 80px)' }} // 100vh - Header(80px)
        >

            {/* 1. Toolbar: Fixed Height */}
            <div className="h-10 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700 shrink-0 z-20">
                <div className="flex items-center gap-2">
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

                <div className="flex items-center">
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

                    <button
                        onClick={handleRunCode}
                        disabled={isExecuting || !isConnected}
                        className={`ml-4 px-4 py-1 rounded font-medium text-sm transition-colors flex items-center gap-2
                            ${isExecuting || !isConnected
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        {isExecuting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Running
                            </>
                        ) : (
                            <>
                                <span>▶</span> Run
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. Editor Area: Flex Grow to take available space */}
            <div className="flex-1 min-h-0 relative w-full">
                <Editor
                    height="100%"
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
                        },
                    }}
                />
            </div>

            {/* 3. Output Console: Fixed Height at Bottom */}
            <div className="h-[200px] bg-black border-t border-gray-700 flex flex-col shrink-0 z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="bg-gray-800 px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold select-none flex justify-between items-center h-8 shrink-0">
                    <span className="flex items-center gap-2">
                        <span className="text-green-500">➜</span> Console Output
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-[10px]">Read-only</span>
                        {executionOutput && (
                            <button
                                onClick={() => setExecutionOutput('')}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-gray-300 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {executionOutput
                        ? executionOutput
                        : <span className="text-gray-600 italic opacity-50">Run your code to see the output here...</span>
                    }
                </div>
            </div>
        </div>
    );
};

export default CollaborativeEditor;
