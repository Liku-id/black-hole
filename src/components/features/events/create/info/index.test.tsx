import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useCities, usePaymentMethods, useEventTypes } from '@/hooks';

import { CreateEventForm } from './index';

// Mock hooks
jest.mock('@/hooks', () => ({
  useCities: jest.fn(),
  usePaymentMethods: jest.fn(),
  useEventTypes: jest.fn()
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
        { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' }
      ],
      loading: false
    });
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        'Virtual Account': [
          {
            id: 'pm1',
            name: 'Bank Transfer',
            type: 'Virtual Account',
            bank: { name: 'BCA', channelCode: 'BCA' }
          }
        ]
      },
      loading: false
    });
    mockUseEventTypes.mockReturnValue({
      eventTypes: ['concert', 'festival'],
      loading: false
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

