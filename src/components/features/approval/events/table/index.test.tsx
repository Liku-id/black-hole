import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { EventSubmission } from '@/types/events-submission';

import SubmissionsTable from './index';

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

describe('SubmissionsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockSubmissions: EventSubmission[] = [
    {
      id: '1',
      event: {
        id: 'event1',
        name: 'Test Event 1',
        startDate: '2024-01-15',
        eventStatus: 'published',
        metaUrl: 'test-event-1'
      } as any,
      createdAt: '2024-01-10',
      eventUpdateRequest: {
        id: 'req1',
        status: 'pending'
      } as any
    },
    {
      id: '2',
      event: {
        id: 'event2',
        name: 'Test Event 2',
        startDate: '2024-02-20',
        eventStatus: 'draft',
        metaUrl: 'test-event-2'
      } as any,
      createdAt: '2024-01-12',
      eventUpdateRequest: null
    }
  ] as any;

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading submissions...')).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table headers', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={mockSubmissions}
          loading={false}
        />
      );

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Event Name')).toBeInTheDocument();
      expect(screen.getByText('Event Date')).toBeInTheDocument();
      expect(screen.getByText('Event Status')).toBeInTheDocument();
      expect(screen.getByText('Submitted At')).toBeInTheDocument();
      expect(screen.getByText('Approval Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render submission data', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={mockSubmissions}
          loading={false}
        />
      );

      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    it('should not render Approval Status column when activeTab is not current_event', () => {
      render(
        <SubmissionsTable
          activeTab="past_event"
          submissions={mockSubmissions}
          loading={false}
        />
      );

      expect(screen.queryByText('Approval Status')).not.toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should navigate to approval detail when view button is clicked', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={[mockSubmissions[0]]}
          loading={false}
        />
      );

      const viewButton = screen.getAllByAltText('View')[0].closest('button');
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(mockPush).toHaveBeenCalledWith('/approval/1');
      }
    });
  });

  describe('Pagination', () => {
    it('should render pagination and invoke onPageChange cleanly', () => {
      const mockOnPageChange = jest.fn();
      const { rerender } = render(
        <SubmissionsTable
          activeTab="current_event"
          currentPage={0}
          loading={false}
          pageSize={10}
          submissions={mockSubmissions}
          total={20}
          onPageChange={mockOnPageChange}
        />
      );

      // Pagination component should be rendered
      expect(screen.getAllByText(/Showing/i).length).toBeGreaterThan(0);

      // Click next page button in Pagination (first instance = mobile/collapsible wrapper)
      const nextButtons = screen.getAllByTestId('KeyboardArrowRightIcon');
      fireEvent.click(nextButtons[0].closest('button')!);
      expect(mockOnPageChange).toHaveBeenCalledWith(1);

      // Without onPageChange callback
      rerender(
        <SubmissionsTable
          activeTab="current_event"
          currentPage={0}
          loading={false}
          pageSize={10}
          submissions={mockSubmissions}
          total={20}
        />
      );
      expect(() =>
        fireEvent.click(
          screen.getAllByTestId('KeyboardArrowRightIcon')[0].closest('button')!
        )
      ).not.toThrow();
    });
  });

  describe('Empty Data Handling', () => {
    it('should render fallback "-" when submission fields are missing', () => {
      const emptySubmission: EventSubmission = {
        id: '3',
        event: {
          id: 'event3',
          name: '',
          startDate: '',
          eventStatus: '',
          metaUrl: ''
        } as any,
        createdAt: '',
        eventUpdateRequest: null
      } as any;

      render(
        <SubmissionsTable
          activeTab="current_event"
          loading={false}
          submissions={[emptySubmission]}
        />
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should render table with empty submissions array', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={[]}
          loading={false}
        />
      );

      // Table headers should still be rendered
      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Event Name')).toBeInTheDocument();
    });
  });
});
