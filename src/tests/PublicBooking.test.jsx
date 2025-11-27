import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PublicBooking from '../pages/PublicBooking';

// Mock hooks
const mockUseProvider = vi.fn();
const mockUseBooking = vi.fn();

vi.mock('../hooks/useProvider', () => ({
    useProvider: (id, type) => mockUseProvider(id, type)
}));

vi.mock('../hooks/useBooking', () => ({
    useBooking: (providerId, service, date, settings) => mockUseBooking(providerId, service, date, settings)
}));

describe('PublicBooking', () => {
    const mockShowToast = vi.fn();
    const mockOnBack = vi.fn();
    const mockSubmitBooking = vi.fn();

    const mockProvider = {
        id: 'provider-123',
        businessName: 'Test Business',
        businessUrl: 'test-business',
        services: [
            { id: 's1', name: 'Test Service', duration: 30, price: 50 }
        ],
        settings: {
            dayStart: '09:00',
            dayEnd: '17:00',
            gapMinutes: 15,
            currency: '$'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        mockUseProvider.mockReturnValue({ provider: null, loading: true, error: null });
        mockUseBooking.mockReturnValue({ timeSlots: [], submitBooking: mockSubmitBooking, loading: false, error: null });
    });

    it('renders loading state initially', () => {
        render(<PublicBooking businessName="test-business" showToast={mockShowToast} onBack={mockOnBack} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders provider services when loaded', async () => {
        mockUseProvider.mockReturnValue({ provider: mockProvider, loading: false, error: null });

        render(<PublicBooking businessName="test-business" showToast={mockShowToast} onBack={mockOnBack} />);

        await waitFor(() => {
            expect(screen.getByText('Test Business')).toBeInTheDocument();
            expect(screen.getByText('Test Service (30m)')).toBeInTheDocument();
        });
    });

    it('shows error when provider not found', async () => {
        mockUseProvider.mockReturnValue({ provider: null, loading: false, error: null });

        render(<PublicBooking businessName="non-existent" showToast={mockShowToast} onBack={mockOnBack} />);

        await waitFor(() => {
            expect(screen.getByText('Provider not found.')).toBeInTheDocument();
        });
    });
});
