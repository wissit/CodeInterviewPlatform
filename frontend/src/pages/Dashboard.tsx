import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Join State
    const [sessionId, setSessionId] = useState('');

    // Create State
    const [sessionTitle, setSessionTitle] = useState('Technical Interview');
    const [sessionLanguage, setSessionLanguage] = useState('javascript');
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    const handleCreateSession = async () => {
        setIsCreatingSession(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/sessions`,
                { title: sessionTitle, language: sessionLanguage },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newSessionId = response.data.id;
            navigate(`/session/${newSessionId}`);
        } catch (error: any) {
            console.error('Error creating session:', error);
            alert(error.response?.data?.error || 'Failed to create session');
        } finally {
            setIsCreatingSession(false);
            setShowCreateModal(false);
        }
    };

    const handleJoinSession = async () => {
        if (!sessionId.trim()) {
            alert('Please enter a session ID');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/sessions/${sessionId}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/session/${sessionId}`);
        } catch (error: any) {
            console.error('Error joining session:', error);
            alert(error.response?.data?.error || 'Failed to join session');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Code Interview Platform
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Welcome, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">User Profile</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Role</p>
                                <span className={`px-2 py-1 rounded text-sm ${user?.role === 'INTERVIEWER' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'}`}>
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-purple-400">Quick Actions</h2>
                        <div className="space-y-4">
                            {user?.role === 'INTERVIEWER' && (
                                <button
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <span>🚀</span> Create New Session
                                </button>
                            )}
                            <button
                                className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
                                onClick={() => setShowJoinModal(true)}
                            >
                                Join Existing Session
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Session Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4 text-blue-400">Start New Session</h3>

                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Session Title</label>
                            <input
                                type="text"
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Programming Language</label>
                            <select
                                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                value={sessionLanguage}
                                onChange={(e) => setSessionLanguage(e.target.value)}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="typescript">TypeScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateSession}
                                disabled={isCreatingSession}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition flex justify-center"
                            >
                                {isCreatingSession ? 'Creating...' : 'Launch Session'}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded font-semibold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Session Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Join Session</h3>
                        <input
                            type="text"
                            placeholder="Enter Session ID"
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleJoinSession}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition"
                            >
                                Join
                            </button>
                            <button
                                onClick={() => {
                                    setShowJoinModal(false);
                                    setSessionId('');
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded font-semibold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
