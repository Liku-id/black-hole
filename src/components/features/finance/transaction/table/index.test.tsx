import { render, screen, fireEvent } from '@testing-library/react';
import { FinanceTransactionTable } from './index';
import { useRouter } from 'next/router';

// Mock Router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Hooks
const mockSummaries = [
  {
    eventId: 'e1',
    eventName: 'Event One',
    eventStatus: 'published',
    totalAmount: '100000',
    availableAmount: '80000',
    pendingSettlementAmount: '20000',
  },
];

jest.mock('@/hooks', () => ({
  useWithdrawalSummaries: ({}: any) => ({
    summaries: mockSummaries,
    loading: false,
    error: null,
    pagination: { totalRecords: 1, totalPages: 1 },
  }),
}));

// Mock Utils
jest.mock('@/utils', () => ({
  formatUtils: {
    formatPrice: (val: number) => `Rp ${val}`,
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('FinanceTransactionTable', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders table with data', () => {
    render(<FinanceTransactionTable loading={false} />);
    
    expect(screen.getByText('Event Name')).toBeInTheDocument();
    expect(screen.getByText('Event One')).toBeInTheDocument();
    expect(screen.getByText('Rp 100000')).toBeInTheDocument();
  });

  it('navigates on view action', () => {
    render(<FinanceTransactionTable loading={false} />);
    
    // Find the view button by its alt text on the image
    const viewIcon = screen.getByAltText('View');
    const viewButton = viewIcon.closest('button');
    
    if (viewButton) {
      fireEvent.click(viewButton);
      expect(mockPush).toHaveBeenCalledWith('/finance/event-transactions/e1');
    }
  });

  // We could test loading/error states by overriding the mock for specific tests, 
  // but jest.mock happens at module level. 
  // To test different hook returns, we need to mock the implementation inside the test.
});
