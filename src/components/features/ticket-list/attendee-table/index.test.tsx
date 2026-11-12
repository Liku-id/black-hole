import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { useExportTickets } from '@/hooks';
import { ticketsService } from '@/services';
import { UserRole } from '@/types/auth';

import { AttendeeTable } from './index';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockShowInfo = jest.fn();
const mockShowError = jest.fn();

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showInfo: mockShowInfo, showError: mockShowError })
}));

const mockExportTickets = jest.fn();
jest.mock('@/hooks', () => ({
  useExportTickets: jest.fn()
}));

jest.mock('@/services', () => ({
  ticketsService: { redeemTicket: jest.fn() }
}));

jest.mock('@/utils', () => ({
  dateUtils: {
    formatDateDDMMYYYYHHMM: () => '01/01/2023 10:00'
  }
}));

jest.mock('@/components/common', () => {
  const { createElement } = require('react');
  const {
    CollapsibleCardListMock
  } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Pagination: ({ onPageChange }: any) =>
      createElement(
        'button',
        { 'data-testid': 'pagination-next', onClick: () => onPageChange(2) },
        'Pagination'
      ),
    MultiSelect: ({ onChange }: any) =>
      createElement(
        'button',
        {
          'data-testid': 'multi-select',
          onClick: () => onChange?.(['tt1', 'tt2'])
        },
        'MultiSelect'
      ),
    Select: ({ onChange }: any) =>
      createElement(
        'button',
        {
          'data-testid': 'select-status',
          onClick: () => onChange?.('redeemed')
        },
        'Select'
      ),
    CollapsibleCardList: CollapsibleCardListMock,
    Button: ({ children, onClick, disabled }: any) =>
      createElement('button', { onClick, disabled }, children)
  };
});

jest.mock('../modal', () => ({
  TicketDetailModal: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="ticket-detail-modal">
        <button type="button" onClick={onClose}>
          Close Detail
        </button>
      </div>
    ) : null
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseExportTickets = useExportTickets as jest.Mock;

const mockAttendeeData = [
  {
    no: 1,
    id: 'a1',
    ticketId: 't1',
    name: 'Jane Doe',
    ticketType: 'Regular',
    phoneNumber: '123',
    date: '2023-01-01',
    paymentMethod: 'CC',
    redeemStatus: 'issued',
    bookingType: 'online'
  },
  {
    no: 2,
    id: 'a2',
    ticketId: 't2',
    name: 'John Smith',
    ticketType: 'VIP',
    phoneNumber: '456',
    date: '2023-01-02',
    paymentMethod: 'VA',
    redeemStatus: 'redeemed'
  },
  {
    no: 3,
    id: 'a3',
    ticketId: 't3',
    name: 'Bob Unknown',
    ticketType: 'VIP',
    phoneNumber: '789',
    date: '2023-01-03',
    paymentMethod: 'QRIS',
    redeemStatus: 'other'
  }
];

const mockStats = {
  totalIssued: 10,
  totalRedeem: 5,
  totalTicket: 15
};

describe('AttendeeTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { role: { name: 'admin' } } });
    mockUseExportTickets.mockReturnValue({
      exportTickets: mockExportTickets,
      loading: false
    });
  });

  const clickRowAction = (ticketId = 't1') => {
    const cardItem = screen.getByTestId(`card-item-${ticketId}`);
    const actionBtn = within(cardItem).getByRole('button');
    fireEvent.click(actionBtn);
  };

  it('renders attendee statuses, stats, and handles search, filter, and pagination callbacks', () => {
    const onSearchChange = jest.fn();
    const onTicketTypeChange = jest.fn();
    const onTicketStatusChange = jest.fn();
    const onPageChange = jest.fn();

    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={onSearchChange}
        onRedeemTicket={jest.fn()}
        onTicketTypeChange={onTicketTypeChange}
        onTicketStatusChange={onTicketStatusChange}
        onPageChange={onPageChange}
        selectedTicketTypeIds="tt1"
        stats={mockStats}
      />
    );

    expect(screen.getAllByText('Unredeemed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Redeemed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'John' }
    });
    expect(onSearchChange).toHaveBeenCalledWith('John');

    fireEvent.click(screen.getByTestId('multi-select'));
    expect(onTicketTypeChange).toHaveBeenCalledWith('tt1,tt2');

    fireEvent.click(screen.getByTestId('select-status'));
    expect(onTicketStatusChange).toHaveBeenCalledWith('redeemed');

    fireEvent.click(screen.getByTestId('pagination-next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles export success, failure, and exporting loading state', async () => {
    mockExportTickets.mockResolvedValueOnce(undefined);
    const { rerender } = render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
        selectedEventData={{ id: 'e1', name: 'Event 1' }}
        stats={mockStats}
      />
    );

    fireEvent.click(screen.getByText('Export'));
    await waitFor(() => {
      expect(mockExportTickets).toHaveBeenCalledWith(
        'e1',
        'Event 1',
        undefined,
        ''
      );
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Tickets exported successfully!'
      );
    });

    mockExportTickets.mockRejectedValueOnce(new Error('Export boom'));
    fireEvent.click(screen.getByText('Export'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Export boom');
    });

    mockUseExportTickets.mockReturnValue({
      exportTickets: mockExportTickets,
      loading: true
    });
    rerender(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
        selectedEventData={{ id: 'e1', name: 'Event 1' }}
        stats={mockStats}
      />
    );
    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeDisabled();
  });

  it('handles redeem ticket success and API failure with Back button', async () => {
    const onRedeemTicket = jest.fn();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (ticketsService.redeemTicket as jest.Mock).mockResolvedValueOnce({});

    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        onRedeemTicket={onRedeemTicket}
        searchQuery=""
        onSearchChange={jest.fn()}
        stats={mockStats}
      />
    );

    // Success flow
    clickRowAction('t1');
    fireEvent.click(screen.getByText('Redeem Ticket'));
    fireEvent.click(screen.getByRole('button', { name: 'Redeem' }));

    await waitFor(() => {
      expect(ticketsService.redeemTicket).toHaveBeenCalledWith('a1', {
        ticketStatus: 'redeemed'
      });
      expect(mockShowInfo).toHaveBeenCalledWith('Ticket Redeemed');
      expect(onRedeemTicket).toHaveBeenCalledWith('a1');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    // Error flow
    (ticketsService.redeemTicket as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Already redeemed on server' } }
    });
    clickRowAction('t1');
    fireEvent.click(screen.getByText('Redeem Ticket'));
    fireEvent.click(screen.getByRole('button', { name: 'Redeem' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Already redeemed on server');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to redeem this ticket?')
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('hides Redeem Ticket for GROUND_STAFF and opens Detail Ticket modal', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: { name: UserRole.GROUND_STAFF } }
    });

    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        onRedeemTicket={jest.fn()}
        searchQuery=""
        onSearchChange={jest.fn()}
        stats={mockStats}
      />
    );

    clickRowAction('t1');
    expect(screen.queryByText('Redeem Ticket')).not.toBeInTheDocument();
    expect(screen.getByText('Detail Ticket')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Detail Ticket'));
    expect(screen.getByTestId('ticket-detail-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close Detail' }));
    await waitFor(() => {
      expect(
        screen.queryByTestId('ticket-detail-modal')
      ).not.toBeInTheDocument();
    });
  });

  it('renders loading and empty states without stats skeleton crash', () => {
    const { rerender } = render(
      <AttendeeTable
        attendeeData={[]}
        loading={true}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
      />
    );
    expect(screen.getAllByText('Loading tickets...').length).toBeGreaterThan(0);

    rerender(
      <AttendeeTable
        attendeeData={[]}
        loading={false}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
      />
    );
    expect(screen.getAllByText('No tickets found').length).toBeGreaterThan(0);
  });
});
