import { fireEvent, screen, waitFor } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { eventsService } from '@/services/events';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';

import { OTSActivationSection } from './index';

jest.mock('@/contexts/ToastContext', () => {
  const actual = jest.requireActual('@/contexts/ToastContext');
  return {
    ...actual,
    useToast: jest.fn()
  };
});

jest.mock('@/services/events', () => ({
  eventsService: {
    requestOTSActivation: jest.fn()
  }
}));

const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockRequestOTSActivation =
  eventsService.requestOTSActivation as jest.MockedFunction<
    typeof eventsService.requestOTSActivation
  >;

describe('OTSActivationSection', () => {
  const mockShowInfo = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: mockShowError,
      showToast: jest.fn()
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows pending message when isPending is true', () => {
    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={true}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    expect(
      screen.getByText(
        'On-the-spot sales request already exists or is being processed for this event'
      )
    ).toBeInTheDocument();
  });

  it('shows contact organizer message when user is not EVENT_ORGANIZER_PIC', () => {
    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.CASHIER}
      />
    );

    expect(
      screen.getByText(
        'On-the-spot sales is not activated for this event. Please contact your Event Organizer to activate it.'
      )
    ).toBeInTheDocument();
  });

  it('opens and closes ActivateModal for EVENT_ORGANIZER_PIC', () => {
    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    expect(screen.getByText('Active OTS')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByText('Active OTS')).not.toBeInTheDocument();
  });

  it('shows error if selectedEventId is empty on activate', async () => {
    renderWithProviders(
      <OTSActivationSection
        selectedEventId=""
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Please select an Event to activate OTS.'
      );
    });
    expect(mockRequestOTSActivation).not.toHaveBeenCalled();
  });

  it('submits OTS activation request successfully and closes modal', async () => {
    mockRequestOTSActivation.mockResolvedValue({ statusCode: 200 });

    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockRequestOTSActivation).toHaveBeenCalledWith('event-1');
      expect(mockShowInfo).toHaveBeenCalledWith(
        'OTS Request submitted successfully!'
      );
    });
    expect(screen.queryByText('Active OTS')).not.toBeInTheDocument();
  });

  it('shows duplicate request error when error message contains 19329', async () => {
    mockRequestOTSActivation.mockRejectedValue({
      response: { data: { message: 'Error code 19329' } }
    });

    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'On-the-spot sales request already exists or is being processed for this event'
      );
    });
  });

  it('shows duplicate request error when response statusCode is 19329', async () => {
    mockRequestOTSActivation.mockRejectedValue({
      response: { data: { statusCode: 19329 } }
    });

    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'On-the-spot sales request already exists or is being processed for this event'
      );
    });
  });

  it('shows generic error on other failure', async () => {
    mockRequestOTSActivation.mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to submit OTS request.'
      );
    });
  });

  it('shows generic error when rejected value has no message', async () => {
    mockRequestOTSActivation.mockRejectedValue(null);

    renderWithProviders(
      <OTSActivationSection
        selectedEventId="event-1"
        isPending={false}
        userRole={UserRole.EVENT_ORGANIZER_PIC}
      />
    );

    fireEvent.click(screen.getByText('Request activate feature'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to submit OTS request.'
      );
    });
  });
});
