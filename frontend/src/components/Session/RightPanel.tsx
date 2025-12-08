import React, { useState } from 'react';

interface RightPanelProps {
    output: string;
    onClearOutput: () => void;
}

type Tab = 'console' | 'chat' | 'notes';

const RightPanel: React.FC<RightPanelProps> = ({ output, onClearOutput }) => {
    const [activeTab, setActiveTab] = useState<Tab>('console');

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col shrink-0 h-full">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-700 bg-gray-800">
                <button
                    onClick={() => setActiveTab('console')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'console'
                            ? 'border-blue-500 text-white bg-gray-800'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        }`}
                >
                    Console
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'chat'
                            ? 'border-blue-500 text-white bg-gray-800'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'notes'
                            ? 'border-blue-500 text-white bg-gray-800'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        }`}
                >
                    Notes
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* CONSOLE TAB (Default) */}
                {activeTab === 'console' && (
                    <div className="absolute inset-0 flex flex-col bg-black">
                        <div className="p-2 flex justify-between items-center bg-gray-800/50 border-b border-gray-800">
                            <span className="text-xs text-gray-500 font-mono">STDOUT / STDERR</span>
                            {output && (
                                <button
                                    onClick={onClearOutput}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex-1 p-4 overflow-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
                            {output || <span className="text-gray-600 italic opacity-50">Run code to see output...</span>}
                        </div>
                    </div>
                )}

                {/* CHAT TAB (Placeholder) */}
                {activeTab === 'chat' && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col p-6 text-center">
                        <span className="text-2xl mb-2">💬</span>
                        <p>Chat feature coming soon!</p>
                    </div>
                )}

                {/* NOTES TAB (Placeholder) */}
                {activeTab === 'notes' && (
                    <div className="absolute inset-0 p-4">
                        <textarea
                            className="w-full h-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="Private interviewer notes..."
                        ></textarea>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
