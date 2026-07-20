
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

import { ticketsService } from '@/services';

import { AttendeeTable } from './index';


// Mocks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: { name: 'admin' } } })
}));

const mockShowInfo = jest.fn();
const mockShowError = jest.fn();

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showInfo: mockShowInfo, showError: mockShowError })
}));

const mockExportTickets = jest.fn();

jest.mock('@/hooks', () => ({
  useExportTickets: () => ({ exportTickets: mockExportTickets, loading: false })
}));

jest.mock('@/services', () => ({
  ticketsService: { redeemTicket: jest.fn() }
}));

jest.mock('@/utils', () => ({
  dateUtils: { 
    formatDateDDMMYYYYHHMM: () => '01/01/2023 10:00' 
  }
}));

// Mock simple components
jest.mock('@/components/common', () => {
  const { createElement } = require('react');
  const { CollapsibleCardListMock } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Pagination: () => createElement('div', { 'data-testid': 'pagination' }, 'Pagination'),
    MultiSelect: () =>
      createElement('div', { 'data-testid': 'multi-select' }, 'MultiSelect'),
    Select: () => createElement('div', { 'data-testid': 'select' }, 'Select'),
    CollapsibleCardList: CollapsibleCardListMock,
    Button: ({ children, onClick, disabled }: any) =>
      createElement('button', { onClick, disabled }, children)
  };
});

jest.mock('../modal', () => ({
  TicketDetailModal: ({ open }: any) => (open ? <div data-testid="ticket-detail-modal">TicketDetailModal</div> : null)
}));

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
    redeemStatus: 'issued', // can be redeemed
    bookingType: 'online'
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
  });

  it('renders attendee data properly', () => {
    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
        stats={mockStats}
      />
    );
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Regular').length).toBeGreaterThan(0);
    expect(screen.getAllByText('t1').length).toBeGreaterThan(0);
    expect(screen.getByText('10')).toBeInTheDocument(); // Stats
  });

  it('handles search input', () => {
    const onSearchChange = jest.fn();
    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={onSearchChange}
        onRedeemTicket={jest.fn()}
        stats={mockStats}
      />
    );
    
    // The Input inside StyledTextField
    const input = screen.getByPlaceholderText('Name');
    fireEvent.change(input, { target: { value: 'John' } });
    expect(onSearchChange).toHaveBeenCalledWith('John');
  });

  it('handles export tickets', () => {
    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
        selectedEventData={{ id: 'e1', name: 'Event 1' }}
        stats={mockStats}
      />
    );

    const exportBtn = screen.getByText('Export');
    fireEvent.click(exportBtn);
    
    expect(mockExportTickets).toHaveBeenCalledWith('e1', 'Event 1', undefined, '');
  });

  const clickFirstRowAction = () => {
    const cardItem = screen.getByTestId('card-item-t1');
    const actionBtn = within(cardItem).getByRole('button');
    fireEvent.click(actionBtn);
  };

  it('opens action menu and shows options', () => {
    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
        stats={mockStats}
      />
    );

    clickFirstRowAction();

    expect(screen.getByText('Redeem Ticket')).toBeInTheDocument();
    expect(screen.getByText('Detail Ticket')).toBeInTheDocument();
  });

  it('handles redeem ticket flow', async () => {
    const onRedeemTicket = jest.fn();
    (ticketsService.redeemTicket as jest.Mock).mockResolvedValue({});

    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        onRedeemTicket={onRedeemTicket}
        searchQuery=""
        onSearchChange={jest.fn()}
        stats={mockStats}
      />
    );

    clickFirstRowAction();

    fireEvent.click(screen.getByText('Redeem Ticket'));

    // Modal should appear
    expect(screen.getByText('Are you sure you want to redeem this ticket?')).toBeInTheDocument();

    // Click Redeem button in modal
    // There are two buttons: Back and Redeem.
    // We can find by text 'Redeem' which is in the button.
    // But 'Redeem Ticket' is also text.
    // The button text is "Redeem" (or "Redeeming..." if loading).
    // "Redeem Ticket" is the title.
    const redeemBtn = screen.getByRole('button', { name: 'Redeem' });
    fireEvent.click(redeemBtn);

    await waitFor(() => {
      expect(ticketsService.redeemTicket).toHaveBeenCalledWith('a1', { ticketStatus: 'redeemed' });
    });
    expect(mockShowInfo).toHaveBeenCalledWith('Ticket Redeemed');
    expect(onRedeemTicket).toHaveBeenCalledWith('a1');
  });

  it('opens detail modal', () => {
    render(
      <AttendeeTable
        attendeeData={mockAttendeeData as any[]}
        onRedeemTicket={jest.fn()}
        searchQuery=""
        onSearchChange={jest.fn()}
        stats={mockStats}
      />
    );

    clickFirstRowAction();

    fireEvent.click(screen.getByText('Detail Ticket'));

    expect(screen.getByTestId('ticket-detail-modal')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <AttendeeTable
        attendeeData={[]}
        loading={true}
        searchQuery=""
        onSearchChange={jest.fn()}
        onRedeemTicket={jest.fn()}
      />
    );
    expect(screen.getAllByText('Loading tickets...').length).toBeGreaterThan(0);
  });

  it('renders empty state', () => {
    render(
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
