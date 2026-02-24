import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GroupTicketTable } from './index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock utils
jest.mock('@/utils', () => ({
  formatPrice: (price: number) => `Rp ${price}`,
  dateUtils: {
    formatDateTimeWIB: (date: string) => date ? `Formatted ${date}` : '-',
  },
}));

// Mock StatusBadge
jest.mock('../../../status-badge', () => ({
  StatusBadge: ({ displayName }: any) => <div data-testid="status-badge">{displayName}</div>,
}));

describe('GroupTicketTable', () => {
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  
  const mockTicketTypes = [
    { id: 't1', name: 'VIP' },
    { id: 't2', name: 'Regular' },
  ];

  const mockTickets = [
    {
      id: '1',
      ticketTypeId: 't1',
      name: 'Group VIP',
      description: 'Desc 1',
      price: 100000,
      quantity: 100,
      bundleQuantity: 5,
      maxOrderQuantity: 2,
      salesStartDate: '2023-01-01',
      salesEndDate: '2023-01-02',
      status: 'approved',
    },
    {
      id: '2',
      ticketTypeId: 't2',
      name: 'Group Regular',
      description: 'Desc 2',
      price: 50000,
      quantity: 200,
      bundleQuantity: 10,
      maxOrderQuantity: 4,
      salesStartDate: '2023-02-01',
      salesEndDate: '2023-02-02',
      status: 'pending',
    },
  ];

  const defaultProps = {
    groupTickets: mockTickets,
    eventStatus: 'draft',
    ticketTypes: mockTicketTypes as any,
    onDelete: mockOnDelete,
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table headers correctly', () => {
    render(<GroupTicketTable {...defaultProps} />);
    
    expect(screen.getByText('No.')).toBeInTheDocument();
    expect(screen.getByText('Ticket Type')).toBeInTheDocument();
    expect(screen.getByText('G. Ticket Name')).toBeInTheDocument();
    expect(screen.getByText('G. Ticket Price')).toBeInTheDocument();
    expect(screen.getByText('Bundle Qty')).toBeInTheDocument();
    expect(screen.getByText('Max per user')).toBeInTheDocument();
    expect(screen.getByText('Sale Start Date')).toBeInTheDocument();
    expect(screen.getByText('Sale End Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders rows data correctly', () => {
    render(<GroupTicketTable {...defaultProps} />);
    
    // Row 1
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Group VIP')).toBeInTheDocument();
    expect(screen.getByText('Rp 100000')).toBeInTheDocument();
    expect(screen.getByText('5 Ticket')).toBeInTheDocument();
    expect(screen.getByText('Formatted 2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();

    // Row 2
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Group Regular')).toBeInTheDocument();
    expect(screen.getByText('Rp 50000')).toBeInTheDocument();
    expect(screen.getByText('10 Ticket')).toBeInTheDocument();
  });

  it('shows empty state when no tickets', () => {
    render(<GroupTicketTable {...defaultProps} groupTickets={[]} />);
    
    expect(screen.getByText(/No tickets found/i)).toBeInTheDocument();
  });

  it('opens menu and calls actions', async () => {
    render(<GroupTicketTable {...defaultProps} />);
    
    // Click action button for first row
    const actionButtons = screen.getAllByRole('button');
    await userEvent.click(actionButtons[0]);
    
    // Check menu items
    const editMenu = screen.getByText('Edit');
    const deleteMenu = screen.getByText('Delete');
    
    expect(editMenu).toBeInTheDocument();
    expect(deleteMenu).toBeInTheDocument();

    // Click Edit
    await userEvent.click(editMenu);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTickets[0]);

    // Re-open menu to click Delete
    await userEvent.click(actionButtons[0]);
    const deleteMenu2 = screen.getByText('Delete');
    await userEvent.click(deleteMenu2);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTickets[0].id);
  });

  it('hides actions for approved tickets in ongoing event', () => {
    // Override eventStatus to on_going
    render(<GroupTicketTable {...defaultProps} eventStatus="on_going" />);
    
    // First ticket is approved, second is pending
    // Should see action button for pending, perhaps not for approved?
    // Logic: if (eventStatus === 'approved' || eventStatus === 'on_going') && ticket.status === 'approved' -> return false
    
    const actionButtons = screen.getAllByRole('button');
    // We expect only 1 action button for the pending ticket (2nd row)
    // Wait, the component renders "-" text if no action.
    
    // The second row corresponds to the pending ticket, which should have actions.
    // The first row corresponds to the approved ticket, which should have NO actions ("-").
    
    expect(screen.getAllByText('-')).toHaveLength(1); // One for the first row's action column
    expect(actionButtons).toHaveLength(1); // One for the second row
  });
});
