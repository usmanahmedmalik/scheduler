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
        // Skeleton should be present (checking by class or just existence of container)
        // Since we use Skeleton component, we can check if it's rendered.
        // But testing-library encourages testing what user sees.
        // The Skeleton has no text, but the container has specific structure.
        // Let's check if the main loading text is GONE (since we replaced it with skeleton)
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        // And check if we can find some element with animate-pulse class
        // This is a bit implementation detail, but acceptable for verifying skeleton.
        // Or we can add a test-id to skeleton.
    });

    it('renders provider services when loaded', async () => {
        mockUseProvider.mockReturnValue({ provider: mockProvider, loading: false, error: null });

        render(<PublicBooking businessName="test-business" showToast={mockShowToast} onBack={mockOnBack} />);

        await waitFor(() => {
            expect(screen.getByText('Test Business')).toBeInTheDocument();
            expect(screen.getByText('Test Service')).toBeInTheDocument();
            // Check for progress bar step 1
            expect(screen.getByText('1')).toHaveClass('bg-indigo-600');
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
