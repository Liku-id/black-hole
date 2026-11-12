import { fireEvent, render, screen } from '@testing-library/react';

import { EventOrganizerDropdown } from './index';

jest.mock('../styles', () => ({
  DropdownContainer: ({ children }: any) => <div>{children}</div>,
  DropdownBox: ({ children }: any) => (
    <div data-testid="dropdown-box">{children}</div>
  ),
  DropdownItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  StyledDivider: () => <hr />
}));

const mockOrganizers = [
  { id: '1', name: 'Org 1' },
  { id: '2', name: 'Org 2' }
];

describe('EventOrganizerDropdown', () => {
  const defaultProps = {
    isAdmin: true,
    pathname: '/dashboard',
    loadingOrganizers: false,
    selectedEOId: '',
    selectedEOName: '',
    eventOrganizers: mockOrganizers as any[],
    searchQuery: '',
    dropdownOpen: true,
    searchInput: 'abc',
    displayValue: 'All Event Organizer',
    onSearchChange: jest.fn(),
    onSearchFocus: jest.fn(),
    onSelectOrganizer: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state, empty search state, external selectedEO, and handlers', () => {
    const { rerender } = render(
      <EventOrganizerDropdown {...defaultProps} loadingOrganizers={true} />
    );
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);

    rerender(
      <EventOrganizerDropdown
        {...defaultProps}
        pathname="/finance/withdrawal/history"
        selectedEOId="ext-99"
        selectedEOName="External EO"
      />
    );
    fireEvent.click(screen.getByText('All Event Organizer'));
    expect(defaultProps.onSelectOrganizer).toHaveBeenCalledWith('0');

    fireEvent.click(screen.getByText('External EO'));
    expect(defaultProps.onSelectOrganizer).toHaveBeenCalledWith('ext-99');

    fireEvent.click(screen.getByText('Org 1'));
    expect(defaultProps.onSelectOrganizer).toHaveBeenCalledWith('1');

    const input = screen.getByDisplayValue('abc');
    fireEvent.focus(input);
    expect(defaultProps.onSearchFocus).toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('xyz');

    rerender(
      <EventOrganizerDropdown
        {...defaultProps}
        pathname="/events/123"
        dropdownOpen={false}
        eventOrganizers={[]}
        searchQuery="missing"
      />
    );
    expect(screen.getByDisplayValue('All Event Organizer')).toBeInTheDocument();

    rerender(
      <EventOrganizerDropdown
        {...defaultProps}
        pathname="/events/123"
        dropdownOpen={true}
        eventOrganizers={[]}
        searchQuery="missing"
      />
    );
    expect(screen.getByText('No event organizers found')).toBeInTheDocument();
  });

  it('does not render if not admin or on unsupported pathname', () => {
    const { rerender } = render(
      <EventOrganizerDropdown {...defaultProps} isAdmin={false} />
    );
    expect(screen.queryByTestId('dropdown-box')).not.toBeInTheDocument();

    rerender(<EventOrganizerDropdown {...defaultProps} pathname="/account" />);
    expect(screen.queryByTestId('dropdown-box')).not.toBeInTheDocument();
  });
});
