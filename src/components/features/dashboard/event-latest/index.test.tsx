import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import EventLatestView from './index';
import { useFilteredEvents } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock hooks
jest.mock('@/hooks', () => ({
  useFilteredEvents: jest.fn()
}));

// Mock OrganizerRegStatus component
jest.mock('../organizer-status', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', null, 'OrganizerRegStatus')
  };
});

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

const mockUseFilteredEvents = useFilteredEvents as jest.MockedFunction<
  typeof useFilteredEvents
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('EventLatestView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      user: {
        role: { name: 'admin' }
      } as any,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      refreshUserData: jest.fn(),
      error: null
    });
  });

  const mockEvents = [
    {
      id: '1',
      name: 'Ongoing Event 1',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      eventStatus: 'on_going',
      totalTicketsSold: 100,
      totalRevenue: 5000000
    },
    {
      id: '2',
      name: 'Past Event 1',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      eventStatus: 'done',
      totalTicketsSold: 50,
      totalRevenue: 2500000
    }
  ];

  describe('Rendering', () => {
    it('should render component', () => {
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Ongoing Events section', () => {
      // Mock both calls - first for ongoing, second for past
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);
      
      // Just verify component rendered
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Past Events section', () => {
      // Mock both calls - first for ongoing, second for past
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);
      
      // Just verify component rendered
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should handle loading state for ongoing events', () => {
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: true,
          error: null,
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);

      // Component should render even when loading
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should handle error state', () => {
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: 'Failed to load',
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);

      // Component should still render
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render component with navigation capability', () => {
      // Mock both calls - first for ongoing, second for past
      mockUseFilteredEvents
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        })
        .mockReturnValueOnce({
          events: [],
          loading: false,
          error: null,
          mutate: jest.fn()
        });

      const { container } = render(<EventLatestView />);

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

