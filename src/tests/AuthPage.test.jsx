import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthPage from '../pages/AuthPage';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockCheckAvailability = vi.fn();

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin,
        register: mockRegister,
        checkAvailability: mockCheckAvailability
    })
}));

describe('AuthPage', () => {
    const mockOnComplete = vi.fn();
    const mockShowToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Default availability to true (returns true if available, so checkAvailability returns true if empty)
        // Wait, checkAvailability returns true if empty (available).
        mockCheckAvailability.mockResolvedValue(true);
    });

    it('renders login form by default', () => {
        render(<AuthPage onComplete={mockOnComplete} showToast={mockShowToast} />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('switches to registration form', () => {
        render(<AuthPage onComplete={mockOnComplete} showToast={mockShowToast} />);
        fireEvent.click(screen.getByText('Create an account'));
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/business url/i)).toBeInTheDocument();
    });

    it('handles login failure', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockLogin.mockRejectedValue(new Error('Auth failed'));

        render(<AuthPage onComplete={mockOnComplete} showToast={mockShowToast} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Auth failed', 'error');
        });

        consoleSpy.mockRestore();
    });

    it('handles registration success', async () => {
        mockRegister.mockResolvedValue({ uid: '123' });

        render(<AuthPage onComplete={mockOnComplete} showToast={mockShowToast} />);
        fireEvent.click(screen.getByText('Create an account'));

        fireEvent.change(screen.getByLabelText(/business name/i), { target: { value: 'My Biz' } });
        fireEvent.change(screen.getByLabelText(/business url/i), { target: { value: 'mybiz' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });

        fireEvent.click(screen.getByRole('button', { name: /get started/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
            expect(mockOnComplete).toHaveBeenCalled();
        });
    });
});
