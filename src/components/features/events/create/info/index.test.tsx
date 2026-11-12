import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { useCities, useEventTypes, usePaymentMethods } from '@/hooks';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';

import { CreateEventForm } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('@/hooks', () => ({
  useCities: jest.fn(),
  usePaymentMethods: jest.fn(),
  useEventTypes: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    return (
      <div>
        {props.customInput}
        <button
          type="button"
          data-testid={`pick-${props.placeholderText}`}
          onClick={() => props.onChange(new Date(2026, 4, 15))}
        >
          Pick Date
        </button>
      </div>
    );
  };
});

const mockUseAuth = useAuth as jest.Mock;
const mockUseCities = useCities as jest.Mock;
const mockUsePaymentMethods = usePaymentMethods as jest.Mock;
const mockUseEventTypes = useEventTypes as jest.Mock;

describe('CreateEventForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Admin User',
        role: { name: UserRole.ADMIN }
      },
      isAuthenticated: true
    });
    mockUseCities.mockReturnValue({
      cities: [{ id: 'city1', name: 'Jakarta' }],
      loading: false,
      error: ''
    });
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        'Virtual Account': [
          {
            id: 'pm1',
            name: 'BCA VA',
            type: 'va',
            logo: '/logo/bca.png',
            bankId: 'bank1',
            requestType: 'VA',
            paymentCode: 'BCA_VIRTUAL_ACCOUNT',
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
      eventTypes: ['concerts', 'workshop'],
      loading: false,
      error: '',
      refetch: jest.fn()
    });
  });

  it('renders fields for EO without Platform Fee and shows disabled Submit when loading', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'EO User',
        role: { name: UserRole.EVENT_ORGANIZER_PIC },
        eventOrganizerId: 'org1'
      }
    });

    renderWithProviders(
      <CreateEventForm
        onSubmit={mockOnSubmit}
        loading={true}
        error="Form submission failed"
      />
    );

    expect(screen.getByText('Event Name*')).toBeInTheDocument();
    expect(screen.getByText('Form submission failed')).toBeInTheDocument();
    expect(
      document.getElementById('platform_fee_field')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('auto-updates tax nominal on eventType change, manages fee %/Rp validation, and submits complete form for Admin', async () => {
    renderWithProviders(
      <CreateEventForm onSubmit={mockOnSubmit} loading={false} />
    );

    expect(document.getElementById('platform_fee_field')).toBeInTheDocument();

    // Fill text fields
    fireEvent.change(screen.getByPlaceholderText('Your Event Name'), {
      target: { value: 'Music Fest 2026' }
    });
    fireEvent.change(screen.getByPlaceholderText('Location'), {
      target: { value: 'GBK Stadium' }
    });
    fireEvent.change(screen.getByPlaceholderText('Location Link'), {
      target: { value: 'maps.google.com/gbk' }
    });
    fireEvent.change(screen.getByPlaceholderText('Website Url'), {
      target: { value: 'https://musicfest.id' }
    });
    fireEvent.change(screen.getByPlaceholderText('Max. 3000 characters'), {
      target: { value: 'Awesome concert event' }
    });
    fireEvent.change(
      screen.getByPlaceholderText('Your Terms & Condition for Event'),
      { target: { value: 'No outside food' } }
    );

    // Select taxable eventType ('concerts') -> updates taxNominal to 10
    fireEvent.click(screen.getByPlaceholderText('Select event type'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Concerts' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Tax percentage')).toHaveValue('10');
    });

    // Switch to non-taxable eventType ('workshop') -> updates taxNominal to 0
    fireEvent.click(screen.getByPlaceholderText('Select event type'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Workshop' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Tax percentage')).toHaveValue('0');
    });

    // Select City & Login Required
    fireEvent.click(screen.getByPlaceholderText('Select City'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jakarta' }));

    fireEvent.click(screen.getByPlaceholderText('Select Yes or No'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Yes' }));

    // Open & save Date Modal
    fireEvent.click(screen.getByPlaceholderText('Select date range'));
    fireEvent.click(screen.getByTestId('pick-Select start date'));
    fireEvent.click(screen.getByTestId('pick-Select end date'));
    fireEvent.click(screen.getByText('Save Data'));
    await waitFor(() => {
      expect(
        screen.queryByText('Start & End Date Event')
      ).not.toBeInTheDocument();
    });

    // Open & save Time Modal (onSubmit awaits async trigger)
    fireEvent.click(screen.getByPlaceholderText('Select time range'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Data' }));
    });
    await waitFor(() => {
      expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
    });

    // Select Payment Method
    fireEvent.click(
      screen.getByPlaceholderText('Select payment methods for your event')
    );
    fireEvent.click(document.getElementById('va_payment_method')!);
    fireEvent.click(document.getElementById('bca_payment_method_checkbox')!);
    fireEvent.click(screen.getByText('Done'));
    await waitFor(() => {
      expect(screen.queryByText('Done')).not.toBeInTheDocument();
    });

    // Test fee validation when % >= 100
    fireEvent.click(document.getElementById('admin_fee_type_selector')!);
    fireEvent.click(screen.getAllByRole('menuitem', { name: '%' })[0]);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Admin fee percentage'), {
      target: { value: '120' }
    });
    fireEvent.change(screen.getByPlaceholderText('Platform fee percentage'), {
      target: { value: '110' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(
        screen.getByText('Admin fee percentage must be less than 100%')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Platform fee percentage must be less than 100%')
      ).toBeInTheDocument();
    });

    // Fix fee values & test Platform Fee type change
    fireEvent.change(screen.getByPlaceholderText('Admin fee percentage'), {
      target: { value: '5' }
    });
    fireEvent.click(document.getElementById('platform_fee_type_selector')!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rp' }));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Platform fee amount'), {
      target: { value: '2500' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'Music Fest 2026',
          city: 'city1',
          platformFee: '2500',
          platformFeeType: 'Rp'
        }),
        false
      );
    });
  });

  it('closes DateModal and TimeModal on Close click', () => {
    renderWithProviders(
      <CreateEventForm onSubmit={mockOnSubmit} loading={false} />
    );

    fireEvent.click(screen.getByPlaceholderText('Select date range'));
    expect(screen.getByText('Start & End Date Event')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Start & End Date Event')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByPlaceholderText('Select time range'));
    expect(screen.getByText('Select Time Range')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
  });
});
