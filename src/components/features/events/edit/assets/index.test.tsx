import { act, fireEvent, render, screen } from '@testing-library/react';

import { EventDetail } from '@/types/event';

import { EventAssetsEditForm } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('EventAssetsEditForm', () => {
  const mockOnFilesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-preview');
    global.URL.revokeObjectURL = jest.fn();
  });

  const makeDetail = (overrides: Partial<EventDetail> = {}): EventDetail => ({
    id: '1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventAssets: [
      {
        id: 'ea-thumb',
        assetId: 'a1',
        order: 1,
        asset: { id: 'a1', url: 'https://example.com/1.jpg', key: 'k1' } as any
      },
      {
        id: 'ea-supp-1',
        assetId: 'a2',
        order: 2,
        asset: { id: 'a2', url: 'https://example.com/2.jpg', key: 'k2' } as any
      }
    ] as any,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    eventType: 'concert',
    description: 'desc',
    address: 'addr',
    mapLocationUrl: 'https://maps.google.com',
    termAndConditions: 'terms',
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
    group_tickets: [],
    ...overrides
  });

  it('handles selecting and removing thumbnail and supporting images from eventAssets', async () => {
    const { container } = render(
      <EventAssetsEditForm
        eventDetail={makeDetail()}
        onFilesChange={mockOnFilesChange}
        showError={true}
      />
    );

    expect(mockOnFilesChange).toHaveBeenCalledWith(
      expect.objectContaining({
        existingAssets: expect.objectContaining({
          thumbnail: expect.objectContaining({
            id: 'a1',
            eventAssetId: 'ea-thumb',
            order: 1
          })
        })
      })
    );

    // Remove existing thumbnail & existing supporting image 0
    const removeIcons = container.querySelectorAll('#clear_icon');
    fireEvent.click(removeIcons[0]);
    fireEvent.click(removeIcons[1]);

    expect(mockOnFilesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        deletedAssetIds: ['ea-thumb', 'ea-supp-1']
      })
    );

    // Re-upload thumbnail & supporting image 0
    const inputs = container.querySelectorAll('input[type="file"]');
    const file1 = new File(['img1'], 'thumb.png', { type: 'image/png' });
    const file2 = new File(['img2'], 'supp.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.change(inputs[0], { target: { files: [file1] } });
    });
    await act(async () => {
      fireEvent.change(inputs[1], { target: { files: [file2] } });
    });

    expect(mockOnFilesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        files: expect.objectContaining({ thumbnail: file1 })
      })
    );

    // Remove newly uploaded files
    const updatedRemoveIcons = container.querySelectorAll('#clear_icon');
    fireEvent.click(updatedRemoveIcons[0]);
    fireEvent.click(updatedRemoveIcons[1]);
  });

  it('handles eventAssetChanges for on_going + rejected and normal states with rejection banner', () => {
    const { container, rerender } = render(
      <EventAssetsEditForm
        eventDetail={makeDetail({ eventStatus: 'on_going' })}
        eventAssetChanges={[
          {
            id: 'change-1',
            status: 'rejected',
            items: [
              {
                id: 'ci-1',
                eventAssetId: 'ea-1',
                assetId: 'a1',
                order: 1,
                asset: { id: 'a1', url: 'https://example.com/c1.jpg' }
              },
              {
                id: 'ci-2',
                eventAssetId: 'ea-2',
                assetId: 'a2',
                order: 2,
                asset: { id: 'a2', url: 'https://example.com/c2.jpg' }
              }
            ]
          } as any
        ]}
        rejectedAssetIds={['a1', 'a2']}
        rejectionReason="Blurry thumbnail"
        onFilesChange={mockOnFilesChange}
      />
    );

    expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
    expect(screen.getByText('Blurry thumbnail')).toBeInTheDocument();

    const removeIcons = container.querySelectorAll('#clear_icon');
    fireEvent.click(removeIcons[0]);
    fireEvent.click(removeIcons[1]);

    // For on_going + rejected, shouldUseIdForOperations picks .id ('ci-1', 'ci-2')
    expect(mockOnFilesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        deletedAssetIds: ['ci-1', 'ci-2']
      })
    );

    // Non-rejected eventAssetChanges uses eventAssetId or falls back to .id
    rerender(
      <EventAssetsEditForm
        eventDetail={makeDetail({ eventStatus: 'draft' })}
        eventAssetChanges={[
          {
            id: 'change-2',
            status: 'pending',
            items: [
              {
                id: 'ci-10',
                eventAssetId: '',
                assetId: 'a1',
                order: 1,
                asset: { id: 'a1', url: 'https://example.com/c1.jpg' }
              }
            ]
          } as any
        ]}
        onFilesChange={mockOnFilesChange}
      />
    );
    expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
  });

  it('renders cleanly without eventDetail', () => {
    render(<EventAssetsEditForm onFilesChange={mockOnFilesChange} />);
    expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
  });
});
