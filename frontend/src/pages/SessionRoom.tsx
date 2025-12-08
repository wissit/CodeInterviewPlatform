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

import LeftPanel from '../components/Session/LeftPanel';
import RightPanel from '../components/Session/RightPanel';

const SessionRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [language, setLanguage] = useState('javascript');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);
    const [executionOutput, setExecutionOutput] = useState<string>('');

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
        <div className="h-screen w-full bg-gray-950 text-white flex overflow-hidden">

            {/* LEFT PANEL: 250px Fixed */}
            <LeftPanel
                sessionId={session.id}
                participants={participants}
                language={language}
                onLanguageChange={setLanguage}
                onLeaveSession={handleLeaveSession}
            />

            {/* CENTER PANEL: Flexible */}
            <div className="flex-1 relative min-w-0 flex flex-col">
                {/* Session Title Header - Minimalist */}
                <div className="h-10 bg-gray-900 border-b border-gray-700 flex items-center px-4 justify-between shrink-0">
                    <h1 className="text-sm font-semibold text-gray-300 truncate">{session.title}</h1>
                    <span className="text-xs text-gray-500">Live Interview</span>
                </div>

                {/* Editor Container */}
                <div className="flex-1 relative">
                    <CollaborativeEditor
                        sessionId={session.id}
                        language={language}
                        onOutputChange={setExecutionOutput}
                    />
                </div>
            </div>

            {/* RIGHT PANEL: 320px Fixed */}
            <RightPanel
                output={executionOutput}
                onClearOutput={() => setExecutionOutput('')}
            />
        </div>
    );
};

export default SessionRoom;
