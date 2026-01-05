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
      },
      createdAt: '2024-01-10',
      eventUpdateRequest: {
        id: 'req1',
        status: 'pending'
      }
    },
    {
      id: '2',
      event: {
        id: 'event2',
        name: 'Test Event 2',
        startDate: '2024-02-20',
        eventStatus: 'draft',
        metaUrl: 'test-event-2'
      },
      createdAt: '2024-01-12',
      eventUpdateRequest: null
    }
  ];

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

      const viewButton = screen.getByAltText('View').closest('button');
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(mockPush).toHaveBeenCalledWith('/approval/1');
      }
    });
  });

  describe('Pagination', () => {
    it('should render pagination when total is provided', () => {
      render(
        <SubmissionsTable
          activeTab="current_event"
          submissions={mockSubmissions}
          loading={false}
          total={20}
          currentPage={0}
          pageSize={10}
        />
      );

      // Pagination component should be rendered
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
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

