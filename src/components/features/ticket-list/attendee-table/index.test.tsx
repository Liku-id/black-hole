
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';

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
  const React = require('react');
  return {
    Pagination: () => <div data-testid="pagination">Pagination</div>,
    MultiSelect: () => <div data-testid="multi-select">MultiSelect</div>,
    Select: () => <div data-testid="select">Select</div>,
    Button: ({ children, onClick, disabled }: any) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
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
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('t1')).toBeInTheDocument(); // Ticket ID
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

    // Find the action button in the row
    // It's the IconButton in the last column.
    // There are other buttons (Export).
    // Let's find the row first.
    const row = screen.getByText('Jane Doe').closest('tr');
    expect(row).toBeInTheDocument();
    
    // Within the row, find the button. 
    // IconButton usually doesn't have text. It has an svg or boxes.
    // We can assume it's the only button in the row (Action column).
    const actionBtn = within(row!).getByRole('button');
    fireEvent.click(actionBtn);

    // Menu should open
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

    // Open menu
    const row = screen.getByText('Jane Doe').closest('tr');
    const actionBtn = within(row!).getByRole('button');
    fireEvent.click(actionBtn);

    // Click Redeem Ticket item
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

    // Open menu
    const row = screen.getByText('Jane Doe').closest('tr');
    const actionBtn = within(row!).getByRole('button');
    fireEvent.click(actionBtn);

    // Click Detail Ticket
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
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
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
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
  });
});
