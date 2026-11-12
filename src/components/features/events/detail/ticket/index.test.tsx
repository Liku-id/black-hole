import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { discountsService } from '@/services/discounts';
import { ticketsService } from '@/services/tickets';
import { EventDetail } from '@/types/event';

import { EventDetailTicket } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/services/discounts', () => ({
  discountsService: {
    getDiscountsByEvent: jest.fn()
  }
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    updateTicketTypeVisibility: jest.fn(),
    updateGroupTicketVisibility: jest.fn()
  }
}));

let capturedTableProps: any[] = [];
jest.mock('./table', () => ({
  EventDetailTicketTable: (props: any) => {
    capturedTableProps.push(props);
    const label = capturedTableProps.length % 2 === 1 ? 'regular' : 'group';
    return (
      <div data-testid={`ticket-table-${label}`}>
        <span>{`${label}-count-${props.ticketTypes.length}`}</span>
        <span>{`role-${props.sessionRole || 'none'}`}</span>
        {props.onTogglePublic && (
          <button onClick={() => props.onTogglePublic(`${label}-1`, false)}>
            {`toggle-${label}`}
          </button>
        )}
        {props.onDiscountsChange && (
          <button onClick={() => props.onDiscountsChange()}>
            {`refresh-discounts-${label}`}
          </button>
        )}
      </div>
    );
  }
}));

describe('EventDetailTicket', () => {
  const mockPush = jest.fn();
  const mockShowError = jest.fn();

  const baseEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventType: 'concert',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [
      {
        id: 'ticket1',
        name: 'VIP Ticket',
        price: 100000,
        quantity: 100,
        max_order_quantity: 5,
        status: 'approved'
      } as any
    ],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: {} as any,
    paymentMethods: [],
    adminFee: 5,
    tax: 10,
    feeThresholds: [],
    eventAssets: [],
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false,
    group_tickets: [
      {
        id: 'gt1',
        name: 'Group 1',
        status: 'approved'
      } as any
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedTableProps = [];
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({
      showError: mockShowError,
      showSuccess: jest.fn(),
      showInfo: jest.fn(),
      showWarning: jest.fn()
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        organizer_type: 'company'
      }
    });
    (discountsService.getDiscountsByEvent as jest.Mock).mockResolvedValue({
      body: { discounts: [{ id: 'd1', ticket_type_id: 'ticket1' }] }
    });
    (ticketsService.updateTicketTypeVisibility as jest.Mock).mockResolvedValue(
      undefined
    );
    (ticketsService.updateGroupTicketVisibility as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render headers, fetch discounts, and map EventOrganizer sessionRole', async () => {
    render(<EventDetailTicket eventDetail={baseEventDetail} />);

    await waitFor(() => {
      expect(discountsService.getDiscountsByEvent).toHaveBeenCalledWith('1');
    });

    expect(screen.getByText('Event Ticket')).toBeInTheDocument();
    expect(screen.getByText('Group Ticket')).toBeInTheDocument();
    expect(screen.getAllByText('Ticket Category').length).toBe(2);
    expect(
      screen.getAllByText('role-event_organizer_pic').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Edit Ticket')).toBeInTheDocument();
    expect(screen.getByText('Edit Group Ticket')).toBeInTheDocument();
  });

  it('should map regular User role and handle missing eventDetail.id or fetch failure', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '2', role: { name: 'admin' } }
    });
    (discountsService.getDiscountsByEvent as jest.Mock).mockRejectedValueOnce(
      new Error('Network down')
    );

    const { rerender } = render(
      <EventDetailTicket eventDetail={baseEventDetail} />
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch discounts:',
        expect.any(Error)
      );
    });
    expect(screen.getAllByText('role-admin').length).toBeGreaterThan(0);

    jest.clearAllMocks();
    rerender(
      <EventDetailTicket eventDetail={{ ...baseEventDetail, id: '' }} />
    );
    expect(discountsService.getDiscountsByEvent).not.toHaveBeenCalled();
  });

  it('should navigate to edit tickets and edit group tickets pages', async () => {
    render(<EventDetailTicket eventDetail={baseEventDetail} />);

    await waitFor(() => {
      expect(discountsService.getDiscountsByEvent).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Edit Ticket'));
    expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event/tickets');

    fireEvent.click(screen.getByText('Edit Group Ticket'));
    expect(mockPush).toHaveBeenCalledWith(
      '/events/edit/test-event/group-tickets'
    );
  });

  it('should show info notice when ticketTypes is empty and hide edit buttons for pending/done/on_review/requested/readOnly', async () => {
    const { rerender } = render(
      <EventDetailTicket
        eventDetail={{
          ...baseEventDetail,
          eventStatus: 'draft',
          ticketTypes: [],
          group_tickets: []
        }}
      />
    );

    await waitFor(() => {
      expect(discountsService.getDiscountsByEvent).toHaveBeenCalled();
    });

    expect(
      screen.getByText('Please add at least 1 event ticket first')
    ).toBeInTheDocument();
    expect(screen.queryByText('Edit Group Ticket')).not.toBeInTheDocument();

    // Pending regular and group tickets on on_going event hide edit buttons
    rerender(
      <EventDetailTicket
        eventDetail={{
          ...baseEventDetail,
          eventStatus: 'on_going',
          ticketTypes: [{ id: 't1', status: 'pending' } as any],
          group_tickets: [{ id: 'g1', status: 'pending' } as any]
        }}
      />
    );
    expect(screen.queryByText('Edit Ticket')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Group Ticket')).not.toBeInTheDocument();

    // on_going with is_requested true
    rerender(
      <EventDetailTicket
        eventDetail={{
          ...baseEventDetail,
          eventStatus: 'on_going',
          is_requested: true
        }}
      />
    );
    expect(screen.queryByText('Edit Ticket')).not.toBeInTheDocument();

    // on_review hides edit buttons
    rerender(
      <EventDetailTicket
        eventDetail={{ ...baseEventDetail, eventStatus: 'on_review' }}
      />
    );
    expect(screen.queryByText('Edit Ticket')).not.toBeInTheDocument();

    // hideHeader and approvalMode shows Group Ticket title only
    rerender(
      <EventDetailTicket
        eventDetail={baseEventDetail}
        hideHeader={true}
        approvalMode={true}
      />
    );
    expect(screen.queryByText('Event Ticket')).not.toBeInTheDocument();
    expect(screen.getByText('Group Ticket')).toBeInTheDocument();
    expect(screen.queryByText('toggle-regular')).not.toBeInTheDocument();
  });

  it('should toggle regular and group ticket visibility and handle errors', async () => {
    const onVisibilityChange = jest.fn();
    const onDiscountsChange = jest.fn();

    render(
      <EventDetailTicket
        eventDetail={baseEventDetail}
        onVisibilityChange={onVisibilityChange}
        onDiscountsChange={onDiscountsChange}
      />
    );

    await waitFor(() => {
      expect(discountsService.getDiscountsByEvent).toHaveBeenCalled();
    });

    // Success paths
    fireEvent.click(screen.getByText('toggle-regular'));
    await waitFor(() => {
      expect(ticketsService.updateTicketTypeVisibility).toHaveBeenCalledWith(
        'regular-1',
        false
      );
    });
    expect(onVisibilityChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('toggle-group'));
    await waitFor(() => {
      expect(ticketsService.updateGroupTicketVisibility).toHaveBeenCalledWith(
        'group-1',
        false
      );
    });
    expect(onVisibilityChange).toHaveBeenCalledTimes(2);

    // Refresh discounts callback
    fireEvent.click(screen.getByText('refresh-discounts-regular'));
    await waitFor(() => {
      expect(onDiscountsChange).toHaveBeenCalled();
    });

    // Error paths (response.data.message, Error.message, fallback)
    (ticketsService.updateTicketTypeVisibility as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { message: 'API err' } } })
      .mockRejectedValueOnce(new Error('Regular err'))
      .mockRejectedValueOnce({});

    fireEvent.click(screen.getByText('toggle-regular'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('API err');
    });

    fireEvent.click(screen.getByText('toggle-regular'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Regular err');
    });

    fireEvent.click(screen.getByText('toggle-regular'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to update ticket visibility'
      );
    });

    (ticketsService.updateGroupTicketVisibility as jest.Mock)
      .mockRejectedValueOnce({ response: { data: { message: 'Grp API err' } } })
      .mockRejectedValueOnce(new Error('Grp err'))
      .mockRejectedValueOnce({});

    fireEvent.click(screen.getByText('toggle-group'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Grp API err');
    });

    fireEvent.click(screen.getByText('toggle-group'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Grp err');
    });

    fireEvent.click(screen.getByText('toggle-group'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to update group ticket visibility'
      );
    });
  });
});
