import { render, screen } from '@testing-library/react';

import { useEventOrganizerSummary } from '@/hooks';

import FinanceAnalytic from './index';

// Mock the hooks
jest.mock('@/hooks', () => ({
  useEventOrganizerSummary: jest.fn()
}));

// Mock the AnalyticCard component
jest.mock('./card', () => {
  return function MockAnalyticCard({ title, value }: { title: string; value: string }) {
    return (
      <div data-testid="analytic-card">
        <div>{title}</div>
        <div>{value}</div>
      </div>
    );
  };
});



const mockUseEventOrganizerSummary = useEventOrganizerSummary as jest.MockedFunction<
  typeof useEventOrganizerSummary
>;

describe('FinanceAnalytic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: null,
        loading: true,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should render all analytic cards with correct data', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: '10000000',
          totalAvailable: '8000000',
          totalPlatformFees: '500000',
          pendingSettlementAmount: '1500000'
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      expect(screen.getByText('Total Balance')).toBeInTheDocument();
      expect(screen.getByText('Total Available Balance')).toBeInTheDocument();
      expect(screen.getByText('Total Platform Fee')).toBeInTheDocument();
      expect(screen.getByText('Total Amount Pending')).toBeInTheDocument();

      // Check formatted values
      expect(screen.getByText('Rp 10.000.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 8.000.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 500.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 1.500.000')).toBeInTheDocument();
    });

    it('should render 4 analytic cards', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: '1000000',
          totalAvailable: '800000',
          totalPlatformFees: '50000',
          pendingSettlementAmount: '150000'
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      const cards = screen.getAllByTestId('analytic-card');
      expect(cards).toHaveLength(4);
    });

    it('should handle zero values correctly', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: '0',
          totalAvailable: '0',
          totalPlatformFees: '0',
          pendingSettlementAmount: '0'
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      const zeroValues = screen.getAllByText('Rp 0');
      expect(zeroValues).toHaveLength(4);
    });

    it('should handle null summary values', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: null,
          totalAvailable: null,
          totalPlatformFees: null,
          pendingSettlementAmount: null
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      const zeroValues = screen.getAllByText('Rp 0');
      expect(zeroValues).toHaveLength(4);
    });
  });

  describe('Props', () => {
    it('should pass eventOrganizerId to hook when provided', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: '1000000',
          totalAvailable: '800000',
          totalPlatformFees: '50000',
          pendingSettlementAmount: '150000'
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic eventOrganizerId="org-123" />);

      expect(mockUseEventOrganizerSummary).toHaveBeenCalledWith('org-123');
    });

    it('should work without eventOrganizerId', () => {
      mockUseEventOrganizerSummary.mockReturnValue({
        summary: {
          totalEarnings: '1000000',
          totalAvailable: '800000',
          totalPlatformFees: '50000',
          pendingSettlementAmount: '150000'
        },
        loading: false,
        error: null
      } as any);

      render(<FinanceAnalytic />);

      expect(mockUseEventOrganizerSummary).toHaveBeenCalledWith(undefined);
    });
  });
});
