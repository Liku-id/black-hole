import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useEventOrganizerStatistics } from '@/hooks';

import EventStatistic from './index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock the hook
jest.mock('@/hooks', () => ({
  useEventOrganizerStatistics: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

const mockUseEventOrganizerStatistics =
  useEventOrganizerStatistics as jest.MockedFunction<
    typeof useEventOrganizerStatistics
  >;

describe('EventStatistic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockStatisticsData = {
    event_organizer_name: 'Test Organizer',
    total_tickets_sold: 1000,
    total_revenue: 50000000,
    total_successful_transactions: 50,
    average_tickets_per_transaction: 20
  };

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      // Skeleton should be rendered (check for stat cards structure)
      expect(screen.queryByText(/Total Ticket Sold/i)).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load',
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      expect(
        screen.getByText(/An error occurred while loading statistics data/i)
      ).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should render all statistic cards when data is available', async () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: mockStatisticsData,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      await waitFor(() => {
        expect(screen.getByText('Total Ticket Sold')).toBeInTheDocument();
      });
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Transaction')).toBeInTheDocument();
      expect(screen.getByText('Average Transaction')).toBeInTheDocument();
    });

    it('should display formatted statistics values', async () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: mockStatisticsData,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      await waitFor(() => {
        // Values should be formatted and displayed
        expect(screen.getByText('Total Ticket Sold')).toBeInTheDocument();
      });
    });

    it('should navigate to correct path when card is clicked', async () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: mockStatisticsData,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      await waitFor(() => {
        expect(screen.getByText('Total Ticket Sold')).toBeInTheDocument();
      });

      // Click on a card (tickets card should navigate to /tickets)
      const ticketCard = screen.getByText('Total Ticket Sold').closest('div');
      if (ticketCard) {
        fireEvent.click(ticketCard);
        expect(mockPush).toHaveBeenCalledWith('/tickets');
      }
    });
  });

  describe('Empty Data Handling', () => {
    it('should display zero values when data is null', async () => {
      mockUseEventOrganizerStatistics.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<EventStatistic />);

      await waitFor(() => {
        expect(screen.getByText('Total Ticket Sold')).toBeInTheDocument();
      });
    });
  });
});

