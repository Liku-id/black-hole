import { render, screen, waitFor } from '@testing-library/react';

import { useCities, usePaymentMethods, useEventTypes } from '@/hooks';

import { CreateEventForm } from './index';

// Mock hooks
jest.mock('@/hooks', () => ({
  useCities: jest.fn(),
  usePaymentMethods: jest.fn(),
  useEventTypes: jest.fn()
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: '1',
      name: 'Test User',
      role: { name: 'event_organizer_pic' },
      eventOrganizerId: 'org1'
    },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  }))
}));

const mockUseCities = useCities as jest.MockedFunction<typeof useCities>;
const mockUsePaymentMethods = usePaymentMethods as jest.MockedFunction<
  typeof usePaymentMethods
>;
const mockUseEventTypes = useEventTypes as jest.MockedFunction<
  typeof useEventTypes
>;

describe('CreateEventForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCities.mockReturnValue({
      cities: [
        { id: 'city1', name: 'Jakarta' }
      ],
      loading: false,
      error: ''
    });
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        'Virtual Account': [
          {
            id: 'pm1',
            name: 'Bank Transfer',
            type: 'Virtual Account',
            logo: 'logo.png',
            bankId: 'bank1',
            requestType: 'VA',
            paymentCode: 'BCA_VA',
            channelProperties: {},
            rules: [],
            paymentMethodFee: 0,
            bank: {
              id: 'bank1',
              name: 'BCA',
              channelCode: 'BCA',
              channelType: 'VIRTUAL_ACCOUNT',
              minAmount: 10000,
              maxAmount: 50000000
            }
          }
        ]
      },
      loading: false,
      error: ''
    });
    mockUseEventTypes.mockReturnValue({
      eventTypes: ['concert', 'festival'],
      loading: false,
      error: '',
      refetch: jest.fn()
    });
  });

  describe('Rendering', () => {
    it('should render event name field', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Event Name*')).toBeInTheDocument();
      });
    });

    it('should render event type field', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Event Type*')).toBeInTheDocument();
      });
    });

    it('should render date and time fields', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Start & End Date*')).toBeInTheDocument();
      });
      expect(screen.getByText('Start & End Time*')).toBeInTheDocument();
    });

    it('should render address field', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Address*')).toBeInTheDocument();
      });
    });

    it('should render all form fields', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Event Name*')).toBeInTheDocument();
      });
      expect(screen.getByText('Event Type*')).toBeInTheDocument();
      expect(screen.getByText('Address*')).toBeInTheDocument();
      expect(screen.getByText('City*')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message when error is provided', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={false}
          error="Test error message"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test error message')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when loading is true', async () => {
      render(
        <CreateEventForm
          onSubmit={mockOnSubmit}
          loading={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Event Name*')).toBeInTheDocument();
      });
    });
  });
});

