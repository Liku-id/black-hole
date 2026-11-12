import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { EventAssetChange, EventDetail } from '@/types/event';

import { EventDetailAssets } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

describe('EventDetailAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      const msg = args.map(String).join(' ');
      if (
        msg.includes('non-boolean attribute') ||
        msg.includes('does not recognize the')
      ) {
        return;
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const baseAssets = [
    {
      id: 'asset2',
      assetId: 'a2',
      order: 2,
      asset: { id: 'img2', url: 'https://example.com/2.jpg', key: '' }
    },
    {
      id: 'asset1',
      assetId: 'a1',
      order: 1,
      asset: { id: 'img1', url: 'https://example.com/1.jpg', key: '' }
    },
    {
      id: 'asset3',
      assetId: 'a3',
      order: 3,
      asset: {
        id: 'img3',
        url: 'https://example.com/3.jpg',
        key: 'supporting-2'
      }
    }
  ];

  const mockEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventAssets: baseAssets as any,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    eventType: 'concert',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: {} as any,
    paymentMethods: [],
    adminFee: 5,
    tax: 10,
    feeThresholds: [],
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false,
    group_tickets: []
  };

  describe('Header & Edit Button Visibility', () => {
    it('renders header, Edit Assets button, and navigates on click', () => {
      render(<EventDetailAssets eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Asset')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Edit Assets'));
      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event/assets');
    });

    it('hides header when hideHeader is true and disables button when readOnly is true', () => {
      const { rerender } = render(
        <EventDetailAssets eventDetail={mockEventDetail} hideHeader />
      );
      expect(screen.queryByText('Event Asset')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();

      rerender(<EventDetailAssets eventDetail={mockEventDetail} readOnly />);
      expect(screen.getByText('Edit Assets')).toBeDisabled();
    });

    it('hides Edit Assets for done/on_review/pending change and shows for draft/rejected', () => {
      const { rerender } = render(
        <EventDetailAssets
          eventDetail={{ ...mockEventDetail, eventStatus: 'done' }}
        />
      );
      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();

      rerender(
        <EventDetailAssets
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_review' }}
        />
      );
      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();

      rerender(
        <EventDetailAssets
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
        />
      );
      expect(screen.getByText('Edit Assets')).toBeInTheDocument();

      rerender(
        <EventDetailAssets
          eventDetail={{ ...mockEventDetail, eventStatus: 'rejected' }}
        />
      );
      expect(screen.getByText('Edit Assets')).toBeInTheDocument();
    });
  });

  describe('Regular Assets, Sorting & Status Chips', () => {
    it('sorts assets by order and shows Approved/Rejected badges when showStatus is true', () => {
      const changesWithRejectedField: EventAssetChange[] = [
        {
          id: 'chg-1',
          status: 'rejected',
          rejectedReason: 'Blurry main banner',
          rejectedFields: ['a1'],
          items: []
        } as any
      ];

      render(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
          eventAssetChanges={changesWithRejectedField}
        />
      );

      expect(screen.getByText('Blurry main banner')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getAllByText('Approved')).toHaveLength(2);
      expect(screen.getByAltText('Event asset')).toBeInTheDocument();
      expect(screen.getByAltText('Event asset 2')).toBeInTheDocument();
    });

    it('hides Approved badge for on_going event without eventAssetChanges', () => {
      render(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_going' }}
        />
      );

      expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    });

    it('renders empty state when regular assets list is empty', () => {
      render(
        <EventDetailAssets
          eventDetail={{ ...mockEventDetail, eventAssets: [] }}
        />
      );

      expect(screen.getByText('No assets available')).toBeInTheDocument();
    });
  });

  describe('Event Asset Changes (Ongoing / Approved & Approval Mode)', () => {
    const mockChanges = (
      status: string,
      rejectedFields: string[] = []
    ): EventAssetChange[] => [
      {
        id: 'chg-1',
        status,
        rejectedReason: status === 'rejected' ? 'Logo too small' : null,
        rejectedFields,
        items: [
          {
            id: 'item-1',
            assetId: 'chg-a1',
            order: 2,
            asset: { id: 'ci1', url: 'https://example.com/c1.jpg', key: 'c1' }
          },
          {
            id: 'item-2',
            assetId: 'chg-a2',
            order: 1,
            asset: { id: 'ci2', url: 'https://example.com/c2.jpg', key: 'c2' }
          }
        ]
      } as any
    ];

    it('renders Original Assets and Updated Assets with Pending section chip', () => {
      render(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_going' }}
          eventAssetChanges={mockChanges('pending')}
        />
      );

      expect(screen.getByText('Original Assets')).toBeInTheDocument();
      expect(screen.getByText('Updated Assets')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();
    });

    it('renders Rejected & Approved section chips and unknown status fallback', () => {
      const { rerender } = render(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'approved' }}
          eventAssetChanges={mockChanges('rejected', ['chg-a2'])}
        />
      );
      expect(screen.getByText('Logo too small')).toBeInTheDocument();
      expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Approved')).toBeInTheDocument();

      rerender(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'approved' }}
          eventAssetChanges={mockChanges('approved')}
        />
      );
      expect(screen.getByText('Approved')).toBeInTheDocument();

      rerender(
        <EventDetailAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'approved' }}
          eventAssetChanges={mockChanges('custom_status')}
        />
      );
      expect(screen.getByText('Updated Assets')).toBeInTheDocument();
    });

    it('renders approval mode (hideOriginalAssets) with Original Assets below for on_going and empty state when items missing', () => {
      const { rerender } = render(
        <EventDetailAssets
          hideOriginalAssets
          showStatus
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_going' }}
          eventAssetChanges={mockChanges('rejected', ['chg-a1'])}
        />
      );

      expect(screen.getByText('Updated Assets')).toBeInTheDocument();
      expect(screen.getByText('Original Assets')).toBeInTheDocument();

      rerender(
        <EventDetailAssets
          hideOriginalAssets
          eventDetail={{ ...mockEventDetail, eventStatus: 'on_going' }}
          eventAssetChanges={
            [{ id: 'empty', status: 'pending', items: [] }] as any
          }
        />
      );
      expect(screen.getByText('No assets available')).toBeInTheDocument();
    });
  });

  describe('Reject Mode & Checkboxes', () => {
    it('renders checkboxes, calls onToggleAsset for pending assets, and disables approved/rejected checkboxes', () => {
      const onToggleAsset = jest.fn();

      const { rerender } = render(
        <EventDetailAssets
          hideOriginalAssets
          rejectMode
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
          eventAssetChanges={[
            {
              id: 'chg-p',
              status: 'pending',
              items: [
                {
                  id: 'i1',
                  assetId: 'a1',
                  order: 1,
                  asset: { url: 'https://example.com/1.jpg', key: 'k1' }
                },
                {
                  id: 'i2',
                  assetId: 'a2',
                  order: 2,
                  asset: { url: 'https://example.com/2.jpg', key: 'k2' }
                }
              ]
            } as any
          ]}
          selectedAssets={['a1']}
          onToggleAsset={onToggleAsset}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[0]).not.toBeDisabled();

      fireEvent.click(checkboxes[0]);
      expect(onToggleAsset).toHaveBeenCalledWith('a1', false);

      fireEvent.click(checkboxes[1]);
      expect(onToggleAsset).toHaveBeenCalledWith('a2', true);

      // Re-render with approved/rejected items where checkboxes are disabled
      rerender(
        <EventDetailAssets
          hideOriginalAssets
          rejectMode
          eventDetail={{ ...mockEventDetail, eventStatus: 'draft' }}
          eventAssetChanges={[
            {
              id: 'chg-r',
              status: 'rejected',
              rejectedFields: ['a2'],
              items: [
                {
                  id: 'i1',
                  assetId: 'a1',
                  order: 1,
                  asset: { url: 'https://example.com/1.jpg', key: 'k1' }
                },
                {
                  id: 'i2',
                  assetId: 'a2',
                  order: 2,
                  asset: { url: 'https://example.com/2.jpg', key: 'k2' }
                }
              ]
            } as any
          ]}
          selectedAssets={[]}
          onToggleAsset={onToggleAsset}
        />
      );

      const disabledCheckboxes = screen.getAllByRole('checkbox');
      expect(disabledCheckboxes[0]).toBeDisabled();
      expect(disabledCheckboxes[1]).toBeDisabled();
    });
  });
});
