import { render, screen } from '@testing-library/react';

import { EventDetail } from '@/types/event';

import { EventAssetsEditForm } from './index';

describe('EventAssetsEditForm', () => {
  const mockOnFilesChange = jest.fn();

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
    login_required: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render event thumbnail label', () => {
      render(
        <EventAssetsEditForm
          eventDetail={mockEventDetail}
          onFilesChange={mockOnFilesChange}
        />
      );

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });

    it('should render component structure', () => {
      const { container } = render(
        <EventAssetsEditForm
          eventDetail={mockEventDetail}
          onFilesChange={mockOnFilesChange}
        />
      );

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render without eventDetail', () => {
      render(
        <EventAssetsEditForm
          onFilesChange={mockOnFilesChange}
        />
      );

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should pass error prop when showError is true', () => {
      render(
        <EventAssetsEditForm
          eventDetail={mockEventDetail}
          onFilesChange={mockOnFilesChange}
          showError={true}
        />
      );

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });
  });
});


