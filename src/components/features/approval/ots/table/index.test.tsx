import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useToast } from '@/contexts/ToastContext';
import { eventsService } from '@/services/events';
import { OTSApproval } from '@/types/event';

import OTSTable from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/events', () => ({
  eventsService: {
    updateOTSStatus: jest.fn()
  }
}));

jest.mock('@/components/common', () => {
  const {
    CollapsibleCardListMock
  } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Body2: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    CollapsibleCardList: CollapsibleCardListMock,
    Pagination: ({
      currentPage,
      loading,
      onPageChange,
      total
    }: {
      currentPage: number;
      loading?: boolean;
      onPageChange: (page: number) => void;
      total: number;
    }) =>
      loading ? null : (
        <div data-testid="pagination" data-total={total}>
          <button type="button" onClick={() => onPageChange(currentPage + 1)}>
            Next Page
          </button>
        </div>
      ),
    StyledTableBody: ({ children }: { children: React.ReactNode }) => (
      <tbody>{children}</tbody>
    ),
    StyledTableContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    StyledTableHead: ({ children }: { children: React.ReactNode }) => (
      <thead>{children}</thead>
    )
  };
});

jest.mock('@/components/features/events/status-badge', () => ({
  StatusBadge: ({
    displayName,
    status
  }: {
    displayName?: string;
    status: string;
  }) => <span data-testid="status-badge">{displayName || status}</span>
}));

jest.mock('../modal', () => ({
  __esModule: true,
  default: ({
    eventName,
    loading,
    onApprove,
    onClose,
    onReject,
    open
  }: {
    eventName?: string;
    loading?: boolean;
    onApprove: () => void;
    onClose: () => void;
    onReject: () => void;
    open: boolean;
  }) =>
    open ? (
      <div data-testid="ots-modal">
        <span data-testid="modal-event-name">{eventName}</span>
        <span data-testid="modal-loading">{String(Boolean(loading))}</span>
        <button type="button" onClick={onApprove}>
          Confirm Approve
        </button>
        <button type="button" onClick={onReject}>
          Confirm Reject
        </button>
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null
}));

describe('OTSTable', () => {
  const mockPush = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();
  const mockOnRefresh = jest.fn();
  const mockOnPageChange = jest.fn();

  const mockData: OTSApproval[] = [
    {
      id: 'ots-1',
      event_id: 'evt-1',
      requested_by: 'user-1',
      status: 'pending',
      created_at: '2024-06-01',
      event: {
        name: 'Rock Concert',
        metaUrl: 'rock-concert'
      }
    },
    {
      id: 'ots-2',
      event_id: 'evt-2',
      requested_by: 'user-2',
      status: 'approved',
      created_at: '2024-06-02',
      eventName: 'Jazz Night'
    },
    {
      id: 'ots-3',
      event_id: 'evt-3',
      requested_by: 'user-3',
      status: 'rejected',
      created_at: '2024-06-03'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading and empty states', () => {
    const { rerender } = render(<OTSTable data={[]} loading={true} />);
    expect(screen.getByText('Loading OTS requests...')).toBeInTheDocument();

    rerender(<OTSTable data={[]} loading={false} />);
    expect(screen.getByText('No OTS requests found')).toBeInTheDocument();
  });

  it('renders event names with fallbacks and status badges', () => {
    render(<OTSTable data={mockData} total={3} />);

    expect(screen.getAllByText('Rock Concert').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jazz Night').length).toBeGreaterThan(0);
    expect(screen.getAllByText('evt-3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    expect(screen.getAllByText('pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('rejected').length).toBeGreaterThan(0);
  });

  it('opens action menu, navigates to event detail, and hides Review Request for approved/rejected items', () => {
    render(<OTSTable data={mockData} total={3} />);

    const optionButtons = screen
      .getAllByAltText('Options')
      .map((img) => img.closest('button')!);

    // Pending item (index 0) shows both Event Detail and Review Request
    fireEvent.click(optionButtons[0]);
    expect(screen.getByText('Event Detail')).toBeInTheDocument();
    expect(screen.getByText('Review Request')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Event Detail'));
    expect(mockPush).toHaveBeenCalledWith('/events/rock-concert');

    // Approved item (index 1) does not show Review Request
    fireEvent.click(optionButtons[1]);
    expect(screen.getByText('Event Detail')).toBeInTheDocument();
    expect(screen.queryByText('Review Request')).not.toBeInTheDocument();

    // Close menu via Escape
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    // Rejected item (index 2) does not show Review Request
    fireEvent.click(optionButtons[2]);
    expect(screen.queryByText('Review Request')).not.toBeInTheDocument();
  });

  it('handles approve and reject modal flows including refresh and modal close', async () => {
    (eventsService.updateOTSStatus as jest.Mock).mockResolvedValue({});

    const { rerender } = render(
      <OTSTable data={[mockData[0]]} total={1} onRefresh={mockOnRefresh} />
    );

    const openReviewModal = () => {
      const btn = screen.getAllByAltText('Options')[0].closest('button')!;
      fireEvent.click(btn);
      fireEvent.click(screen.getByText('Review Request'));
    };

    // Open and close modal
    openReviewModal();
    expect(screen.getByTestId('ots-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-event-name')).toHaveTextContent(
      'Rock Concert'
    );
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('ots-modal')).not.toBeInTheDocument();

    // Approve flow with onRefresh
    openReviewModal();
    fireEvent.click(screen.getByText('Confirm Approve'));

    await waitFor(() => {
      expect(eventsService.updateOTSStatus).toHaveBeenCalledWith(
        'ots-1',
        'approved'
      );
    });
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'OTS request approved successfully'
    );
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('ots-modal')).not.toBeInTheDocument();

    // Reject flow without onRefresh
    rerender(<OTSTable data={[mockData[0]]} total={1} />);
    openReviewModal();
    fireEvent.click(screen.getByText('Confirm Reject'));

    await waitFor(() => {
      expect(eventsService.updateOTSStatus).toHaveBeenCalledWith(
        'ots-1',
        'rejected'
      );
    });
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'OTS request rejected successfully'
    );
  });

  it('handles missing ID and API errors on approve/reject', async () => {
    (eventsService.updateOTSStatus as jest.Mock)
      .mockRejectedValueOnce(new Error('Update failed'))
      .mockRejectedValueOnce({});

    const itemWithoutId: OTSApproval = {
      ...mockData[0],
      id: ''
    };

    const { rerender } = render(<OTSTable data={[itemWithoutId]} total={1} />);

    const openReviewModal = () => {
      const btn = screen.getAllByAltText('Options')[0].closest('button')!;
      fireEvent.click(btn);
      fireEvent.click(screen.getByText('Review Request'));
    };

    // Missing id branch
    openReviewModal();
    fireEvent.click(screen.getByText('Confirm Approve'));
    expect(mockShowError).toHaveBeenCalledWith('Request ID is missing');
    expect(eventsService.updateOTSStatus).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Close Modal'));

    // Error with message, then error without message
    rerender(<OTSTable data={[mockData[0]]} total={1} />);

    openReviewModal();
    fireEvent.click(screen.getByText('Confirm Approve'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Update failed');
    });

    fireEvent.click(screen.getByText('Confirm Reject'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to rejected OTS request'
      );
    });
  });

  it('handles pagination with and without onPageChange', () => {
    const { rerender } = render(
      <OTSTable
        currentPage={0}
        data={mockData}
        total={20}
        onPageChange={mockOnPageChange}
      />
    );

    fireEvent.click(screen.getAllByText('Next Page')[0]);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    rerender(<OTSTable currentPage={0} data={mockData} total={20} />);
    expect(() =>
      fireEvent.click(screen.getAllByText('Next Page')[0])
    ).not.toThrow();
  });
});
