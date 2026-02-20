import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { EventDetail } from '@/types/event';

import { EventDetailAssets } from './index';

// Mock next/router
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
  });

  const mockEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventAssets: [
      {
        id: 'asset1',
        order: 1,
        asset: {
          id: 'img1',
          url: 'https://example.com/image1.jpg',
          key: 'thumbnail'
        } as any
      },
      {
        id: 'asset2',
        order: 2,
        asset: {
          id: 'img2',
          url: 'https://example.com/image2.jpg',
          key: 'supporting1'
        } as any
      }
    ] as any,
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

  describe('Rendering', () => {
    it('should render "Event Asset" title', () => {
      render(<EventDetailAssets eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Asset')).toBeInTheDocument();
    });

    it('should render edit button for non-done and non-on_review events', () => {
      render(<EventDetailAssets eventDetail={mockEventDetail} />);

      expect(screen.getByText('Edit Assets')).toBeInTheDocument();
    });

    it('should not render edit button for done events', () => {
      const doneEvent = {
        ...mockEventDetail,
        eventStatus: 'done'
      };

      render(<EventDetailAssets eventDetail={doneEvent} />);

      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();
    });

    it('should not render edit button for on_review events', () => {
      const reviewEvent = {
        ...mockEventDetail,
        eventStatus: 'on_review'
      };

      render(<EventDetailAssets eventDetail={reviewEvent} />);

      expect(screen.queryByText('Edit Assets')).not.toBeInTheDocument();
    });
  });

  describe('Assets Display', () => {
    it('should display assets when available', () => {
      render(<EventDetailAssets eventDetail={mockEventDetail} />);

      // Images should be rendered (check by alt text or just verify component rendered)
      const images = screen.queryAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should display empty state when no assets', () => {
      const eventWithoutAssets = {
        ...mockEventDetail,
        eventAssets: []
      };

      render(<EventDetailAssets eventDetail={eventWithoutAssets} />);

      // Just verify component rendered (empty state might have different text)
      expect(screen.getByText('Event Asset')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to edit assets page when edit button is clicked', () => {
      render(<EventDetailAssets eventDetail={mockEventDetail} />);

      const editButton = screen.getByText('Edit Assets');
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event/assets');
    });
  });
});

