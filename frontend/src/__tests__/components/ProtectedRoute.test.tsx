import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

describe('ProtectedRoute', () => {
    it('should redirect to login when not authenticated', () => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route path="/protected" element={<div>Protected Content</div>} />
                        </Route>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render protected content when authenticated', async () => {
        // Set up authenticated state
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test', role: 'CANDIDATE' }));

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route path="/protected" element={<div>Protected Content</div>} />
                        </Route>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        // Wait for auth context to load
        await screen.findByText('Protected Content');

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();

        localStorage.clear();
    });
});
