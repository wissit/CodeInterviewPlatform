import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CollaborativeEditor from '../components/CollaborativeEditor';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

interface Session {
    id: string;
    title: string;
    language: string;
    host: { id: string; name: string; email: string };
    participants: Array<{ user: { name: string; id: string } }>;
}

const SessionRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [language, setLanguage] = useState('javascript');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);

    useEffect(() => {
        if (!id || !user) return;

        // Fetch session details
        const fetchSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/sessions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSession(response.data);
                setLanguage(response.data.language);

                // Extract participant names
                const participantNames = response.data.participants.map((p: any) => p.user.name);
                setParticipants([response.data.host.name, ...participantNames]);
            } catch (error) {
                console.error('Error fetching session:', error);
                navigate('/dashboard');
            }
        };

        fetchSession();

        // Setup Socket.io connection
        const token = localStorage.getItem('token');
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            auth: { token },
        });

        newSocket.on('connect', () => {
            newSocket.emit('join-session', id);
        });

        newSocket.on('user-joined', (data: { userId: string; name: string }) => {
            setParticipants((prev) => [...prev, data.name]);
        });

        newSocket.on('user-left', (data: { userId: string }) => {
            setParticipants((prev) => prev.filter((_, idx) => idx !== prev.length - 1));
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave-session', id);
            newSocket.disconnect();
        };
    }, [id, user, navigate]);

    const handleLeaveSession = async () => {
        if (!id) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/sessions/${id}/leave`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error leaving session:', error);
        }

        navigate('/dashboard');
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading session...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden">
            {/* Header - Fixed Height */}
            <header className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center z-20 h-20 shrink-0 relative">
                <div>
                    <h1 className="text-2xl font-bold">{session.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-400">Host: {session.host.name}</p>
                        <span className="text-gray-600">|</span>
                        <div className="flex items-center gap-2 bg-gray-700 rounded px-2 py-0.5" title="Click to Copy">
                            <span className="text-xs text-gray-400">ID:</span>
                            <code className="text-xs text-blue-300 font-mono select-all cursor-pointer hover:bg-gray-600 px-1 rounded"
                                onClick={() => {
                                    navigator.clipboard.writeText(session.id);
                                    alert('Session ID copied to clipboard!');
                                }}
                            >
                                {session.id}
                            </code>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLeaveSession}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                    Leave Session
                </button>
            </header>

            {/* Main Content - Flex Row */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Editor Wrapper - Takes remaining width, establishes positioning context */}
                <div className="flex-1 min-w-0 relative h-full max-w-[calc(100%-16rem)]">
                    {/* CollaborativeEditor will fill this absolutely */}
                    <CollaborativeEditor sessionId={session.id} language={language} onLanguageChange={setLanguage} />
                </div>

                {/* Sidebar - Fixed width, scrolling independently */}
                <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0 z-50 h-full relative shadow-xl">
                    <div className="p-4 overflow-y-auto flex-1">
                        <h2 className="text-lg font-semibold mb-4">Participants ({participants.length})</h2>
                        <ul className="space-y-2">
                            {participants.map((name, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{name}</span>
                                    {idx === 0 && <span className="text-xs text-purple-400">(Host)</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionRoom;
