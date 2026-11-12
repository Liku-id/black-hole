import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { useCities, useEventTypes, usePaymentMethods } from '@/hooks';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';
import { EventDetail } from '@/types/event';

import { EventEditInfo } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks', () => ({
  useCities: jest.fn(),
  usePaymentMethods: jest.fn(),
  useEventTypes: jest.fn()
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseCities = useCities as jest.Mock;
const mockUsePaymentMethods = usePaymentMethods as jest.Mock;
const mockUseEventTypes = useEventTypes as jest.Mock;

describe('EventEditInfo', () => {
  const mockOnSubmit = jest.fn();

  const baseEventDetail: EventDetail = {
    id: 'event-1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventType: 'concerts',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    startDate: '2025-05-10T10:00:00+07:00',
    endDate: '2025-05-12T22:00:00+07:00',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: { id: 'eo1' } as any,
    paymentMethods: [{ id: 'pm1', name: 'Bank BCA' }] as any,
    adminFee: 5,
    tax: 10,
    feeThresholds: [{ platformFee: '3' }] as any,
    eventAssets: [],
    rejectedReason: 'Please revise event name',
    rejectedFields: ['name', 'address', 'tax'],
    withdrawalFee: '0',
    login_required: false,
    group_tickets: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      pathname: '/events/test-event/edit',
      query: {},
      asPath: '/events/test-event/edit'
    });
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        role: { id: 'r1', name: UserRole.ADMIN }
      }
    });
    mockUseCities.mockReturnValue({
      cities: [
        { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' },
        { id: 'city2', name: 'Bandung', province: 'Jawa Barat' }
      ],
      loading: false
    });
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        'Virtual Account': [
          {
            id: 'pm1',
            name: 'BCA VA',
            type: 'va',
            paymentCode: 'BCA_VIRTUAL_ACCOUNT',
            logo: '/logo/bca.png',
            bank: { id: 'b1', name: 'Bank BCA', channelCode: 'BCA' }
          }
        ]
      },
      loading: false
    });
    mockUseEventTypes.mockReturnValue({
      eventTypes: ['concerts', 'workshop'],
      loading: false
    });
  });

  it('renders admin view with pre-filled values, rejected reason, Platform Fee, and submits updated form', async () => {
    renderWithProviders(
      <EventEditInfo
        eventDetail={baseEventDetail}
        error="Server error occurred"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
    expect(screen.getByDisplayValue('maps.google.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Request Update Event Details' })
    ).toBeInTheDocument();
    expect(document.getElementById('platform_fee_field')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Request Update Event Details' })
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('uses eventUpdateRequest data, Rp fee thresholds, and hides Platform Fee for EO users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'eo-1',
        eventOrganizerId: 'eo-1',
        role: { id: 'r2', name: UserRole.EVENT_ORGANIZER_PIC }
      }
    });

    const detailWithUpdateRequest: EventDetail = {
      ...baseEventDetail,
      eventStatus: 'draft',
      eventUpdateRequest: {
        name: 'Updated Request Name',
        eventType: 'workshop',
        address: 'Updated Street',
        mapLocationUrl: '',
        websiteUrl: 'https://updated.com',
        cityId: 'city2',
        paymentMethodIds: ['pm1'],
        adminFee: 5000,
        tax: 0,
        feeThresholds: [{ platformFee: '2500' }],
        description: 'Updated description',
        termAndConditions: 'Updated terms',
        login_required: true,
        startDate: '',
        endDate: '',
        rejectedReason: '',
        rejectedFields: []
      } as any
    };

    renderWithProviders(
      <EventEditInfo eventDetail={detailWithUpdateRequest} />
    );

    expect(
      screen.getByDisplayValue('Updated Request Name')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(
      document.getElementById('platform_fee_field')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Update Event Details' })
    ).toBeInTheDocument();
  });

  it('disables form fields and blocks opening modals when eventStatus is on_review', () => {
    renderWithProviders(
      <EventEditInfo
        eventDetail={{
          ...baseEventDetail,
          eventStatus: 'on_review',
          adminFee: undefined as any,
          feeThresholds: [],
          tax: 0,
          login_required: true
        }}
      />
    );

    const dateInput = screen.getByPlaceholderText('Select date range');
    const timeInput = screen.getByPlaceholderText('Select time range');
    expect(dateInput).toBeDisabled();
    expect(timeInput).toBeDisabled();

    fireEvent.click(dateInput);
    expect(
      screen.queryByText('Start & End Date Event')
    ).not.toBeInTheDocument();

    fireEvent.click(timeInput);
    expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
  });

  it('opens and saves DateModal & TimeModal, updates tax when eventType changes, and validates % fee limits', async () => {
    renderWithProviders(
      <EventEditInfo
        eventDetail={{
          ...baseEventDetail,
          eventStatus: 'on_going',
          adminFee: 10,
          feeThresholds: [{ platformFee: '2000' }] as any
        }}
        onSubmit={mockOnSubmit}
      />
    );

    // Open and save Date Modal
    fireEvent.click(screen.getByPlaceholderText('Select date range'));
    expect(screen.getByText('Start & End Date Event')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save Data'));

    await waitFor(() => {
      expect(
        screen.queryByText('Start & End Date Event')
      ).not.toBeInTheDocument();
    });

    // Open and save Time Modal
    fireEvent.click(screen.getByPlaceholderText('Select time range'));
    expect(screen.getByText('Select Time Range')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Data' }));

    await waitFor(() => {
      expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
    });

    // Change Event Type via custom Select menu to non-taxable ('workshop')
    fireEvent.click(screen.getByPlaceholderText('Select event type'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Workshop' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Tax percentage')).toHaveValue('0');
    });

    // Validate Admin Fee >= 100 in % mode and Platform Fee >= 100 when switched back to %
    const adminFeeInput = screen.getByPlaceholderText('Admin fee percentage');
    fireEvent.change(adminFeeInput, { target: { value: '120' } });

    const platformSelector = document.getElementById(
      'platform_fee_type_selector'
    ) as HTMLElement;
    fireEvent.click(platformSelector);
    fireEvent.click(screen.getByRole('menuitem', { name: '%' }));

    const platformFeeInput = screen.getByPlaceholderText(
      'Platform fee percentage'
    );
    fireEvent.change(platformFeeInput, { target: { value: '150' } });

    fireEvent.click(
      screen.getByRole('button', { name: 'Request Update Event Details' })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Admin fee percentage must be less than 100%')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Platform fee percentage must be less than 100%')
      ).toBeInTheDocument();
    });

    // Clear platformFee to cover optional branch and switch admin fee selector to Rp
    fireEvent.change(platformFeeInput, { target: { value: '' } });
    const adminDropdown = screen.getAllByText('%')[0].closest('span')!;
    fireEvent.click(adminDropdown);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rp' }));
    expect(screen.getByPlaceholderText('Admin fee amount')).toBeInTheDocument();
  });

  it('closes DateModal and TimeModal via Close button without saving', () => {
    renderWithProviders(<EventEditInfo eventDetail={baseEventDetail} />);

    fireEvent.click(screen.getByPlaceholderText('Select date range'));
    expect(screen.getByText('Start & End Date Event')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Start & End Date Event')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByPlaceholderText('Select time range'));
    expect(screen.getByText('Select Time Range')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
  });
});
