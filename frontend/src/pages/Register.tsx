import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'INTERVIEWER' | 'CANDIDATE'>('CANDIDATE');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                name,
                role,
            });

            const { user, token } = response.data;
            setSuccess('Registration successful! Logging you in...');
            login(token, user);
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Create Account
                </h2>
                {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
                {success && <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Role</label>
                        <select
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'INTERVIEWER' | 'CANDIDATE')}
                        >
                            <option value="CANDIDATE">Candidate (Interviewee)</option>
                            <option value="INTERVIEWER">Interviewer</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded font-bold transition transform hover:scale-105"
                    >
                        Register
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
