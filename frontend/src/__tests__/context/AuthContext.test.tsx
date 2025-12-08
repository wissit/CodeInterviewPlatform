import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Test component that uses the auth context
function TestComponent() {
    const { user, isAuthenticated, login, logout } = useAuth();

    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <div data-testid="user-email">{user?.email || 'no-user'}</div>
            <button onClick={() => login('test-token', { id: '1', email: 'test@test.com', name: 'Test', role: 'CANDIDATE' })}>
                Login
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should provide initial unauthenticated state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });

    it('should authenticate user on login', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        loginButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
            expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
        });

        // Check localStorage
        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('user')).toContain('test@test.com');
    });

    it('should clear authentication on logout', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Login first
        screen.getByText('Login').click();

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });

        // Then logout
        screen.getByText('Logout').click();

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
            expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should restore authentication from localStorage', async () => {
        localStorage.setItem('token', 'stored-token');
        localStorage.setItem('user', JSON.stringify({ id: '2', email: 'stored@test.com', name: 'Stored', role: 'INTERVIEWER' }));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
            expect(screen.getByTestId('user-email')).toHaveTextContent('stored@test.com');
        });
    });
});
