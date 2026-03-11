import { render, screen } from '@testing-library/react';

import { useTransactionSummary } from '@/hooks';

import { TransactionSummary } from './index';

// Mock hook
jest.mock('@/hooks', () => ({
  useTransactionSummary: jest.fn()
}));


const mockUseTransactionSummary = useTransactionSummary as jest.MockedFunction<
  typeof useTransactionSummary
>;

describe('TransactionSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render skeletons when loading', () => {
      mockUseTransactionSummary.mockReturnValue({
        summary: null,
        loading: true,
        error: null
      } as any);

      render(<TransactionSummary eventId="1" />);
      
      // Check that we have skeletons
      // Skeleton usually renders as a span with specific classes, but here we can check if values are NOT present
      // or check for MUI Skeleton class presence if we really want to be specific, or typically it has a role or test id if we add it. 
      // Since we didn't add test id to Skeleton, let's verify values are NOT shown
      expect(screen.queryByText('Rp 1.000.000')).not.toBeInTheDocument();
      
      // We can also verify the titles are present even during loading (if that's the desired behavior)
      expect(screen.getByText('Total Ticket Sales')).toBeInTheDocument();
    });
  });

  describe('Data Rendering', () => {
    it('should render summary data correctly', () => {
      mockUseTransactionSummary.mockReturnValue({
        summary: {
          ticketSales: { total: 100 },
          payment: 1000000,
          withdrawal: 500000,
          balance: 500000
        },
        loading: false,
        error: null
      } as any);

      render(<TransactionSummary eventId="1" />);

      // Titles
      expect(screen.getByText('Total Ticket Sales')).toBeInTheDocument();
      expect(screen.getByText('Total Payment')).toBeInTheDocument();
      expect(screen.getByText('Total Withdrawal')).toBeInTheDocument();
      expect(screen.getByText('Available Balance')).toBeInTheDocument();

      // Values (assuming formatUtils does basic formatting)
      // Note: formatUtils behavior should be consistent. standard is usually localized currency
      expect(screen.getByText(/100/)).toBeInTheDocument(); // ticket sales
      expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument(); // payment
      
      const val500 = screen.getAllByText(/500\.000/);
      expect(val500.length).toBeGreaterThanOrEqual(2); // withdrawal and balance
    });

    it('should handle zero values', () => {
      mockUseTransactionSummary.mockReturnValue({
        summary: {
          ticketSales: { total: 0 },
          payment: 0,
          withdrawal: 0,
          balance: 0
        },
        loading: false,
        error: null
      } as any);

      render(<TransactionSummary eventId="1" />);

      expect(screen.getByText('0')).toBeInTheDocument(); 
    });
  });

  describe('Props', () => {
    it('should pass eventId to the hook', () => {
      mockUseTransactionSummary.mockReturnValue({
        summary: null,
        loading: true,
        error: null
      } as any);

      render(<TransactionSummary eventId="test-event-id" />);

      expect(mockUseTransactionSummary).toHaveBeenCalledWith('test-event-id');
    });

    it('should pass empty string to hook if eventId is missing', () => {
       mockUseTransactionSummary.mockReturnValue({
        summary: null,
        loading: true,
        error: null
      } as any);

      render(<TransactionSummary />);

      expect(mockUseTransactionSummary).toHaveBeenCalledWith('');
    });
  });
});
