import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { usePaymentMethods } from '@/hooks';
import { UserRole } from '@/types/auth';
import { EventDetail } from '@/types/event';
import { apiUtils } from '@/utils';

import { EventDetailInfo, RejectedReason } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks', () => ({
  usePaymentMethods: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

describe('EventDetailInfo', () => {
  const organizerUser = {
    id: '1',
    name: 'Organizer User',
    role: { name: 'event_organizer_pic' },
    eventOrganizerId: 'org1'
  };

  const adminUser = {
    id: 'admin-1',
    name: 'Admin User',
    role: { name: UserRole.ADMIN },
    eventOrganizerId: null
  };

  const bdUser = {
    id: 'bd-1',
    name: 'BD User',
    role: { name: UserRole.BUSINESS_DEVELOPMENT },
    eventOrganizerId: null
  };

  const mockEventDetail: EventDetail = {
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
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-20T22:00:00Z',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: {} as any,
    paymentMethods: [
      { id: 'pm1', name: 'Bank Transfer', type: 'bank_transfer' },
      { id: 'pm2', name: 'Credit Card', type: 'credit_card' }
    ] as any,
    adminFee: 5,
    tax: 10,
    feeThresholds: [{ id: 'ft-1', platformFee: '3.5' }] as any,
    eventAssets: [],
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false,
    group_tickets: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: organizerUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn()
    });
    (usePaymentMethods as jest.Mock).mockReturnValue({
      paymentMethods: {
        ewallet: [
          { id: 'pm1', name: 'Bank Transfer', type: 'bank_transfer' },
          { id: 'pm2', name: 'OVO', type: 'ewallet' }
        ],
        payment_link: [
          { id: 'pm3', name: 'Xendit Link', type: 'payment_link' }
        ],
        unnamed_pl: [{ id: 'pm4', name: '', type: 'payment_link' }]
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering & Formatting', () => {
    it('renders event fields including high adminFee, empty city, and payment methods', () => {
      const eventWithRpFee: EventDetail = {
        ...mockEventDetail,
        city: undefined as any,
        adminFee: 5000,
        login_required: true,
        paymentMethods: []
      };

      render(<EventDetailInfo eventDetail={eventWithRpFee} />);

      expect(screen.getByText('Event Detail')).toBeInTheDocument();
      expect(screen.getByText('Rp 5000')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('formats payment_link with and without sub-methods', () => {
      const { rerender } = render(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            paymentMethods: [
              { id: 'pl-1', name: 'LinkAja', type: 'payment_link' },
              { id: 'pm-1', name: 'BCA VA', type: 'va' }
            ] as any
          }}
        />
      );
      expect(screen.getByText('LinkAja (BCA VA)')).toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            paymentMethods: [
              { id: 'pl-2', name: '', type: 'payment_link' }
            ] as any
          }}
        />
      );
      expect(
        screen.getByText('Payment Link (All Payment Methods)')
      ).toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            paymentMethods: [
              { id: 'pl-3', name: '', type: 'payment_link' },
              { id: 'pm-2', name: 'QRIS', type: 'qris' }
            ] as any
          }}
        />
      );
      expect(screen.getByText('Payment Link (QRIS)')).toBeInTheDocument();
    });

    it('renders Platform Fee only for Admin and BD users across all threshold formats', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: adminUser,
        isAuthenticated: true
      });

      const { rerender } = render(
        <EventDetailInfo eventDetail={mockEventDetail} />
      );
      expect(screen.getByText('Platform Fee')).toBeInTheDocument();
      expect(screen.getByText('3.5%')).toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            feeThresholds: [{ id: 'ft-2', platformFee: '2500' }] as any
          }}
        />
      );
      expect(screen.getByText('Rp 2,500')).toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            feeThresholds: []
          }}
        />
      );
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Edit & Preview Button Visibility', () => {
    it('hides edit button for done events', () => {
      render(
        <EventDetailInfo
          eventDetail={{ ...mockEventDetail, eventStatus: 'done' }}
        />
      );
      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();
    });

    it('shows edit button for on_review when user is Admin or BD', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: bdUser });

      render(
        <EventDetailInfo
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_review' }}
        />
      );

      const btn = screen.getByText('Edit Event Details');
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event');
    });

    it('handles ongoing/approved events with draft eventUpdateRequestStatus', () => {
      const { rerender } = render(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'on_going',
            eventUpdateRequestStatus: 'draft',
            eventUpdateRequest: { eventDetailStatus: 'pending' } as any
          }}
        />
      );
      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'approved',
            eventUpdateRequestStatus: 'draft',
            eventUpdateRequest: { eventDetailStatus: 'approved' } as any
          }}
        />
      );
      const editApproved = screen.getByText('Edit Event Details');
      fireEvent.click(editApproved);
      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event');

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'on_going',
            eventUpdateRequestStatus: 'draft',
            eventUpdateRequest: { eventDetailStatus: 'rejected' } as any
          }}
        />
      );
      expect(screen.getByText('Edit Event Details')).toBeInTheDocument();
    });

    it('hides edit button when on_going/approved is_requested is true or status is pending', () => {
      const { rerender } = render(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'on_going',
            is_requested: true
          }}
        />
      );
      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();

      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'draft',
            eventUpdateRequestStatus: 'pending'
          }}
        />
      );
      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();
    });

    it('respects readOnly prop on edit button', () => {
      render(<EventDetailInfo eventDetail={mockEventDetail} readOnly />);
      const editBtn = screen.getByText('Edit Event Details');
      expect(editBtn).toBeDisabled();
    });
  });

  describe('Draft Preview Flow', () => {
    const originalWukongUrl = process.env.NEXT_PUBLIC_WUKONG_URL;

    afterEach(() => {
      if (originalWukongUrl === undefined) {
        delete process.env.NEXT_PUBLIC_WUKONG_URL;
      } else {
        process.env.NEXT_PUBLIC_WUKONG_URL = originalWukongUrl;
      }
    });

    it('opens preview modal, handles confirm success, and opens window with encrypted token', async () => {
      delete process.env.NEXT_PUBLIC_WUKONG_URL;
      const getSpy = jest.spyOn(apiUtils, 'get').mockResolvedValue({
        accessToken: 'raw-access-token',
        refreshToken: 'ref'
      });
      const postSpy = jest.spyOn(apiUtils, 'post').mockResolvedValue({
        encryptedToken: 'enc/tok=123'
      });
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

      render(
        <EventDetailInfo
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
        />
      );

      fireEvent.click(screen.getByText('Edit Event Details'));
      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event');

      fireEvent.click(screen.getByText('Preview Event'));
      expect(
        screen.getByText('Are you sure want to preview this event in new tab?')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText('Yes, Preview'));

      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledWith('/api/auth/tokens');
        expect(postSpy).toHaveBeenCalledWith('/api/preview-token/encrypt', {
          token: 'raw-access-token'
        });
        expect(openSpy).toHaveBeenCalledWith(
          'https://wukong.co.id/event/test-event?preview_token=enc%2Ftok%3D123',
          '_blank',
          'noopener,noreferrer'
        );
      });

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Are you sure want to preview this event in new tab?'
          )
        ).not.toBeInTheDocument();
      });

      process.env.NEXT_PUBLIC_WUKONG_URL = 'https://custom.wukong.id';
      fireEvent.click(screen.getByText('Preview Event'));
      fireEvent.click(screen.getByText('Yes, Preview'));

      await waitFor(() => {
        expect(openSpy).toHaveBeenCalledWith(
          'https://custom.wukong.id/event/test-event?preview_token=enc%2Ftok%3D123',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('closes preview modal when Back is clicked or API fails', async () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      jest.spyOn(apiUtils, 'get').mockRejectedValue(new Error('Token failed'));

      render(
        <EventDetailInfo
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
        />
      );

      fireEvent.click(screen.getByText('Preview Event'));
      fireEvent.click(screen.getByText('Back'));
      expect(
        screen.queryByText(
          'Are you sure want to preview this event in new tab?'
        )
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Preview Event'));
      fireEvent.click(screen.getByText('Yes, Preview'));

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          'Error fetching or encrypting token:',
          expect.any(Error)
        );
      });
      expect(
        screen.queryByText(
          'Are you sure want to preview this event in new tab?'
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('Update Request Diffs & Rejections', () => {
    it('renders new values across all field types including BD platform fee changes', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: adminUser });

      const updatedEvent: EventDetail = {
        ...mockEventDetail,
        eventStatus: 'approved',
        eventUpdateRequest: {
          status: 'pending',
          name: 'Updated Event Name',
          eventType: 'festival',
          startDate: '2025-02-01T12:00:00Z',
          endDate: '2025-02-05T18:00:00Z',
          time: 'changed-time',
          address: 'New Address 99',
          cityId: 'city2',
          city: { id: 'city2', name: 'Bandung' },
          mapLocationUrl: 'https://maps.new',
          description: 'Updated description',
          termAndConditions: 'Updated terms',
          adminFee: 7500,
          paymentMethodIds: ['pm3', 'pm2'],
          websiteUrl: 'https://updated.com',
          tax: 12,
          feeThresholds: [{ platformFee: '5000' }],
          login_required: true
        } as any
      };

      const { rerender } = render(
        <EventDetailInfo eventDetail={updatedEvent} />
      );

      expect(screen.getByText(/Updated Event Name/)).toBeInTheDocument();
      expect(screen.getByText(/festival/)).toBeInTheDocument();
      expect(screen.getByText(/Bandung/)).toBeInTheDocument();
      expect(screen.getByText(/Rp 7500/)).toBeInTheDocument();
      expect(screen.getByText(/Xendit Link \(OVO\)/)).toBeInTheDocument();
      expect(screen.getByText(/12%/)).toBeInTheDocument();
      expect(screen.getByText(/Rp 5,000/)).toBeInTheDocument();
      expect(screen.getByText(/Yes/)).toBeInTheDocument();

      // Test alternative updateRequest fallbacks (missing city object, missing dates, <100 fees, login false)
      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            login_required: true,
            paymentMethods: undefined as any,
            eventUpdateRequest: {
              status: 'pending',
              name: '',
              cityId: 'city-id-only',
              time: 'changed-time',
              adminFee: 8,
              paymentMethodIds: undefined,
              feeThresholds: [],
              login_required: false
            } as any
          }}
        />
      );

      expect(screen.getByText(/city-id-only/)).toBeInTheDocument();
      expect(screen.getByText(/8%/)).toBeInTheDocument();
      expect(screen.getByText(/→ No/)).toBeInTheDocument();
      expect(screen.getByText(/→ -/)).toBeInTheDocument();

      // Test feeThresholds < 100 and fallback dates missing on original event
      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            startDate: '' as any,
            endDate: '' as any,
            eventUpdateRequest: {
              status: 'pending',
              startDate: '2025-03-01T10:00:00Z',
              endDate: '2025-03-02T10:00:00Z',
              feeThresholds: [{ platformFee: '2.5' }]
            } as any
          }}
        />
      );
      expect(screen.getByText(/2.5%/)).toBeInTheDocument();

      // Test newDateRange empty when updateRequest start/end missing
      rerender(
        <EventDetailInfo
          eventDetail={{
            ...mockEventDetail,
            eventUpdateRequest: {
              status: 'pending'
            } as any
          }}
        />
      );
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    it('shows update request rejection reason and field icons over event rejection', () => {
      render(
        <EventDetailInfo
          showRejectionInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'on_going',
            rejectedReason: 'Original event rejection',
            rejectedFields: ['address'],
            eventUpdateRequest: {
              status: 'rejected',
              rejectedReason: 'Update request bad name',
              rejectedFields: ['name', 'city']
            } as any
          }}
        />
      );

      expect(screen.getByText('Update request bad name')).toBeInTheDocument();
      expect(
        screen.queryByText('Original event rejection')
      ).not.toBeInTheDocument();
    });

    it('shows event rejection reason and icons when showRejectionInfo is true', () => {
      render(
        <EventDetailInfo
          showRejectionInfo
          eventDetail={{
            ...mockEventDetail,
            eventStatus: 'rejected',
            rejectedReason: 'Please fix name and dates',
            rejectedFields: ['name', 'start_date']
          }}
        />
      );

      expect(screen.getByText('Please fix name and dates')).toBeInTheDocument();
    });
  });

  describe('RejectedReason Component', () => {
    it('renders when non-empty and returns null for empty or whitespace reason', () => {
      const { rerender, container } = render(
        <RejectedReason reason="Test rejection reason" />
      );
      expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
      expect(screen.getByText('Test rejection reason')).toBeInTheDocument();

      rerender(<RejectedReason reason="   " />);
      expect(container.firstChild).toBeNull();

      rerender(<RejectedReason reason={null as any} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
