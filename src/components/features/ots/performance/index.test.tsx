import { fireEvent, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { useOTSSummary, useStaff } from '@/hooks';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';

import { OTSPerformanceSection } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks', () => ({
  useOTSSummary: jest.fn(),
  useStaff: jest.fn()
}));

jest.mock('./table', () => ({
  PerformanceTable: ({ eventId, cashierId }: any) => (
    <div data-testid="performance-table">
      {eventId}:{cashierId}
    </div>
  )
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseOTSSummary = useOTSSummary as jest.MockedFunction<
  typeof useOTSSummary
>;
const mockUseStaff = useStaff as jest.MockedFunction<typeof useStaff>;

describe('OTSPerformanceSection', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    mockUseOTSSummary.mockReturnValue({
      summary: {
        totalRevenue: 'Rp 100.000',
        ticketSold: 10,
        totalTransaction: 5,
        totalVisitors: 10
      },
      loading: false,
      error: null,
      mutate: jest.fn()
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders cashier view with Your Transactions table', () => {
    mockUseAuth.mockReturnValue({ user: null } as any);
    mockUseStaff.mockReturnValue({ staffList: [] } as any);

    renderWithProviders(
      <OTSPerformanceSection
        eventId="event-1"
        userRole={UserRole.CASHIER}
        userId="cashier-99"
      />
    );

    expect(mockUseStaff).toHaveBeenCalledWith('', { page: 0, limit: 100 });
    expect(screen.getByText('Rp 100.000')).toBeInTheDocument();
    expect(screen.getByText('Your Transactions')).toBeInTheDocument();
    expect(screen.getByTestId('performance-table')).toHaveTextContent(
      'event-1:cashier-99'
    );
  });

  it('renders EO view with cashier tabs, switches tab, and navigates to /team', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'eo-1', organizer_type: 'individual' }
    } as any);
    mockUseStaff.mockReturnValue({
      staffList: [
        { user_id: 'staff-1', full_name: 'Cashier One' },
        { user_id: 'staff-2', full_name: 'Cashier Two' }
      ]
    } as any);

    renderWithProviders(
      <OTSPerformanceSection
        eventId="event-1"
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    expect(mockUseStaff).toHaveBeenCalledWith('eo-1', { page: 0, limit: 100 });
    expect(screen.getByText('Cashier Details')).toBeInTheDocument();
    expect(screen.getByTestId('performance-table')).toHaveTextContent(
      'event-1:staff-1'
    );

    fireEvent.click(screen.getByText('Cashier Two'));
    expect(screen.getByTestId('performance-table')).toHaveTextContent(
      'event-1:staff-2'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add New Cashier' }));
    expect(mockPush).toHaveBeenCalledWith('/team');
  });

  it('renders empty cashier prompt for EO when staffList is undefined/empty and navigates on click', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'eo-1', organizer_type: 'individual' }
    } as any);
    mockUseStaff.mockReturnValue({
      staffList: undefined
    } as any);

    renderWithProviders(
      <OTSPerformanceSection
        eventId="event-1"
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    expect(
      screen.getByText(
        /You haven't added a cashier account to your OTS feature/i
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Add Cashier'));
    expect(mockPush).toHaveBeenCalledWith('/team');
  });

  it('renders only summary cards for other user roles', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', role: { name: UserRole.ADMIN } }
    } as any);
    mockUseStaff.mockReturnValue({ staffList: [] } as any);

    renderWithProviders(
      <OTSPerformanceSection eventId="event-1" userRole={UserRole.ADMIN} />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.queryByText('Your Transactions')).not.toBeInTheDocument();
    expect(screen.queryByText('Cashier Details')).not.toBeInTheDocument();
  });
});
