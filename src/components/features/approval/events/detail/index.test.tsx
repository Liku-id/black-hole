import { fireEvent, render, screen } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { usePaymentMethods } from '@/hooks';
import { UserRole } from '@/types/auth';
import { EventDetail } from '@/types/event';

import { EventsSubmissionsInfo } from './index';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks', () => ({
  usePaymentMethods: jest.fn()
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUsePaymentMethods = usePaymentMethods as jest.Mock;

describe('EventsSubmissionsInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        role: { name: UserRole.EVENT_ORGANIZER_PIC },
        eventOrganizerId: 'org1'
      },
      isAuthenticated: true
    });
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        'Virtual Account': [
          { id: 'pm1', name: 'Bank Transfer', type: 'va' },
          { id: 'pm2', name: 'Credit Card', type: 'cc' },
          { id: 'pm_link', name: 'Payment Link', type: 'payment_link' }
        ]
      }
    });
  });

  const mockEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    eventType: 'Concert',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    metaUrl: 'test-event',
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-15T22:00:00Z',
    eventStatus: 'pending',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta' },
    eventOrganizer: {} as any,
    paymentMethods: [
      { id: 'pm1', name: 'Bank Transfer', type: 'Virtual Account' } as any,
      { id: 'pm2', name: 'Credit Card', type: 'Credit Card' } as any
    ],
    adminFee: 5,
    tax: 10,
    feeThresholds: [{ platformFee: '3' }] as any,
    eventAssets: [],
    is_requested: false,
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false,
    group_tickets: []
  };

  it('renders event fields, formatting branches, and payment link combinations', () => {
    const { rerender } = render(
      <EventsSubmissionsInfo eventDetail={mockEventDetail} />
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer / Credit Card')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.queryByText('Platform Fee')).not.toBeInTheDocument();

    // Payment link only -> All Payment Methods; empty paymentMethods -> ''; adminFee >= 100 -> Rp
    rerender(
      <EventsSubmissionsInfo
        eventDetail={{
          ...mockEventDetail,
          adminFee: 5000,
          login_required: true,
          websiteUrl: '',
          city: null as any,
          paymentMethods: [
            { id: 'pm_link', name: 'Payment Link', type: 'payment_link' } as any
          ]
        }}
      />
    );
    expect(
      screen.getByText('Payment Link (All Payment Methods)')
    ).toBeInTheDocument();
    expect(screen.getByText('Rp 5000')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // Payment link + sub methods + rejection reason
    rerender(
      <EventsSubmissionsInfo
        eventDetail={{
          ...mockEventDetail,
          rejectedReason: 'Invalid address details',
          rejectedFields: ['address', 'start_date'],
          paymentMethods: [
            {
              id: 'pm_link',
              name: 'Payment Link',
              type: 'payment_link'
            } as any,
            { id: 'pm1', name: 'BCA VA', type: 'va' } as any
          ]
        }}
      />
    );
    expect(screen.getByText('Payment Link (BCA VA)')).toBeInTheDocument();
    expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
    expect(screen.getByText('Invalid address details')).toBeInTheDocument();
  });

  it('displays Admin/BD Platform Fee and all eventUpdateRequest diffs', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Admin',
        role: { name: UserRole.ADMIN }
      }
    });

    const eventUpdateRequest = {
      id: 'req-1',
      eventId: '1',
      name: 'Updated Event Name',
      eventType: 'Workshop',
      description: 'Updated description',
      address: 'New Street 12',
      mapLocationUrl: 'https://maps.google.com/new',
      websiteUrl: 'https://updated.com',
      termAndConditions: 'Updated Terms',
      startDate: '2025-02-15T10:00:00Z',
      endDate: '2025-02-16T22:00:00Z',
      cityId: 'city2',
      city: { id: 'city2', name: 'Bandung' },
      paymentMethodIds: ['pm_link'],
      adminFee: 7500,
      tax: 15,
      feeThresholds: [{ platformFee: '2500' }],
      login_required: true,
      rejectedReason: 'Update rejected for date & payment',
      rejectedFields: ['name', 'city']
    } as any;

    const { rerender } = render(
      <EventsSubmissionsInfo
        eventDetail={{
          ...mockEventDetail,
          eventStatus: 'on_going',
          rejectedFields: ['address'],
          rejectedReason: 'Ignored EO reason'
        }}
        eventUpdateRequest={eventUpdateRequest}
      />
    );

    expect(screen.getByText('Platform Fee')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
    expect(screen.getByText('→ Updated Event Name')).toBeInTheDocument();
    expect(screen.getByText('→ Bandung')).toBeInTheDocument();
    expect(
      screen.getByText('→ Payment Link (All Payment Methods)')
    ).toBeInTheDocument();
    expect(screen.getByText(/→ Rp 2,500/)).toBeInTheDocument();
    expect(screen.getByText('→ Yes')).toBeInTheDocument();
    expect(
      screen.getByText('Update rejected for date & payment')
    ).toBeInTheDocument();

    // Check % platform fee + missing feeThresholds
    rerender(
      <EventsSubmissionsInfo
        eventDetail={{
          ...mockEventDetail,
          eventStatus: 'approved',
          feeThresholds: [],
          login_required: true
        }}
        eventUpdateRequest={{
          ...eventUpdateRequest,
          feeThresholds: [{ platformFee: '10' }],
          login_required: false,
          rejectedFields: null
        }}
      />
    );
    expect(screen.getByText('→ 10%')).toBeInTheDocument();
    expect(screen.getByText('→ No')).toBeInTheDocument();
  });

  it('handles rejectMode checkboxes including checked state and array keys', () => {
    const mockOnToggleField = jest.fn();

    render(
      <EventsSubmissionsInfo
        eventDetail={mockEventDetail}
        rejectMode={true}
        selectedFields={['name', 'start_date']}
        onToggleField={mockOnToggleField}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    fireEvent.click(checkboxes[0]);
    expect(mockOnToggleField).toHaveBeenCalledWith('name', false);

    // Toggle unchecked checkbox
    fireEvent.click(checkboxes[1]);
    expect(mockOnToggleField).toHaveBeenCalledWith('event_type', true);
  });
});
