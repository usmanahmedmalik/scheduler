import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';

describe('ProgressBar', () => {
    it('renders correct number of steps', () => {
        render(<ProgressBar currentStep={1} totalSteps={3} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('highlights current step', () => {
        render(<ProgressBar currentStep={2} totalSteps={3} />);
        // Step 1 should be completed (checkmark)
        expect(screen.getByText('✓')).toBeInTheDocument();
        // Step 2 should be active (we can check class or just existence)
        expect(screen.getByText('2')).toHaveClass('bg-indigo-600');
    });

    it('renders labels if provided', () => {
        const labels = ['Start', 'Middle', 'End'];
        render(<ProgressBar currentStep={1} totalSteps={3} labels={labels} />);
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('Middle')).toBeInTheDocument();
        expect(screen.getByText('End')).toBeInTheDocument();
    });
});

describe('Skeleton', () => {
    it('renders with default classes', () => {
        const { container } = render(<Skeleton />);
        expect(container.firstChild).toHaveClass('animate-pulse', 'bg-gray-200');
    });

    it('applies variant classes', () => {
        const { container } = render(<Skeleton variant="circular" />);
        expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('accepts custom className', () => {
        const { container } = render(<Skeleton className="w-10 h-10" />);
        expect(container.firstChild).toHaveClass('w-10', 'h-10');
    });
});
