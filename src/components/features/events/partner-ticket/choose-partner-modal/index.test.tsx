import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { usePartners, usePartnerTicketTypes } from '@/hooks';

import { ChoosePartnerModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks', () => ({
  usePartners: jest.fn(),
  usePartnerTicketTypes: jest.fn()
}));

const mockPush = jest.fn();
const mockUsePartners = usePartners as jest.Mock;
const mockUsePartnerTicketTypes = usePartnerTicketTypes as jest.Mock;

describe('ChoosePartnerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockUsePartners.mockReturnValue({ partners: [], loading: false });
    mockUsePartnerTicketTypes.mockReturnValue({ partnerTicketTypes: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading state and passes null when IDs are empty', () => {
    mockUsePartners.mockReturnValue({ partners: [], loading: true });

    render(
      <ChoosePartnerModal
        open={true}
        onClose={jest.fn()}
        eventOrganizerId=""
        eventId=""
        metaUrl="my-event"
      />
    );

    expect(mockUsePartners).toHaveBeenCalledWith(null);
    expect(mockUsePartnerTicketTypes).toHaveBeenCalledWith(null);
    expect(screen.getByText('Loading partners...')).toBeInTheDocument();
  });

  it('shows empty state when all partners are added and search empty state after debounce', () => {
    mockUsePartners.mockReturnValue({
      partners: [{ id: 'p1', partner_name: 'Existing Partner' }],
      loading: false
    });
    mockUsePartnerTicketTypes.mockReturnValue({
      partnerTicketTypes: [{ partner_id: 'p1' }]
    });

    const { rerender } = render(
      <ChoosePartnerModal
        open={true}
        onClose={jest.fn()}
        eventOrganizerId="eo-1"
        eventId="ev-1"
        metaUrl="my-event"
      />
    );

    expect(
      screen.getByText(
        'No available partners. All partners are already added to this event.'
      )
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Find Partner'), {
      target: { value: 'xyz' }
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('No partners found')).toBeInTheDocument();

    // Closing modal resets searchInput
    rerender(
      <ChoosePartnerModal
        open={false}
        onClose={jest.fn()}
        eventOrganizerId="eo-1"
        eventId="ev-1"
        metaUrl="my-event"
      />
    );
  });

  it('renders available partners and navigates on click', () => {
    const onClose = jest.fn();
    mockUsePartners.mockReturnValue({
      partners: [
        { id: 'p1', partner_name: 'Added Partner' },
        { id: 'p2', partner_name: 'Available A' },
        { id: 'p3', partner_name: 'Available B' }
      ],
      loading: false
    });
    mockUsePartnerTicketTypes.mockReturnValue({
      partnerTicketTypes: [{ partner_id: 'p1' }]
    });

    render(
      <ChoosePartnerModal
        open={true}
        onClose={onClose}
        eventOrganizerId="eo-1"
        eventId="ev-1"
        metaUrl="my-event"
      />
    );

    expect(screen.queryByText('Added Partner')).not.toBeInTheDocument();
    expect(screen.getByText('Available A')).toBeInTheDocument();
    expect(screen.getByText('Available B')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Available A'));
    expect(mockPush).toHaveBeenCalledWith(
      '/events/my-event/partner-ticket/create-private-link?partnerId=p2'
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
