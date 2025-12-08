import React from 'react';

interface LeftPanelProps {
    sessionId: string;
    participants: string[];
    language: string;
    onLanguageChange: (lang: string) => void;
    onLeaveSession: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
    sessionId,
    participants,
    language,
    onLanguageChange,
    onLeaveSession
}) => {
    const copySessionId = () => {
        navigator.clipboard.writeText(sessionId);
        alert('Session ID copied to clipboard!');
    };

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col shrink-0 h-full">
            {/* Header / Session Controls */}
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Session Controls</h2>

                <button
                    onClick={copySessionId}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded border border-gray-600 flex items-center justify-center gap-2 mb-3 transition-colors"
                >
                    <span>📋</span> Copy Link
                </button>

                <button
                    onClick={onLeaveSession}
                    className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 text-sm py-2 px-3 rounded border border-red-800 transition-colors"
                >
                    Leave Session
                </button>
            </div>

            {/* Language Selector */}
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Language</h2>
                <select
                    className="w-full bg-gray-800 text-white text-sm rounded border border-gray-600 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
            </div>

            {/* Participants */}
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Participants ({participants.length})</h2>
                <ul className="space-y-3">
                    {participants.map((name, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-200 font-medium">{name}</span>
                                {idx === 0 && <span className="text-[10px] text-purple-400">Host</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LeftPanel;
