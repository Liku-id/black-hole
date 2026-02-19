import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventOrganizerDropdown } from './index';

jest.mock('../styles', () => ({
  DropdownContainer: ({ children }: any) => <div>{children}</div>,
  DropdownBox: ({ children }: any) => <div data-testid="dropdown-box">{children}</div>,
  DropdownItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  StyledDivider: () => <hr />
}));

const mockOrganizers = [
  { id: '1', name: 'Org 1' }
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
    searchInput: '',
    displayValue: 'All Event Organizer',
    onSearchChange: jest.fn(),
    onSearchFocus: jest.fn(),
    onSelectOrganizer: jest.fn()
  };

  it('renders correctly when open', () => {
    render(<EventOrganizerDropdown {...defaultProps} />);
    expect(screen.getByTestId('dropdown-box')).toBeInTheDocument();
    expect(screen.getByText('Org 1')).toBeInTheDocument();
  });

  it('does not render if not admin', () => {
    render(<EventOrganizerDropdown {...defaultProps} isAdmin={false} />);
    expect(screen.queryByTestId('dropdown-box')).not.toBeInTheDocument();
  });

  it('calls onSelectOrganizer', () => {
    render(<EventOrganizerDropdown {...defaultProps} />);
    fireEvent.click(screen.getByText('Org 1'));
    expect(defaultProps.onSelectOrganizer).toHaveBeenCalledWith('1');
  });
});
