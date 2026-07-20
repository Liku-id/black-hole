import { render, screen, fireEvent } from '@testing-library/react';

import { TeamMemberTable } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('TeamMemberTable', () => {
  const mockOnPageChange = jest.fn();
  const mockOnOpenDeleteModal = jest.fn();

  const mockMembers = [
    {
      id: '1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: { name: 'ground_staff' },
      status: 'active'
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: { name: 'finance' },
      status: 'active'
    }
  ];

  const defaultProps = {
    teamMembers: mockMembers as any,
    loading: false,
    currentPage: 0,
    pageSize: 10,
    total: 2,
    onPageChange: mockOnPageChange,
    onOpenDeleteModal: mockOnOpenDeleteModal
  };

  it('renders table with data', () => {
    render(<TeamMemberTable {...defaultProps} />);

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ground Staff').length).toBeGreaterThan(0);

    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Finance').length).toBeGreaterThan(0);
  });

  it('opens options menu and clicks delete', () => {
    render(<TeamMemberTable {...defaultProps} />);

    const optionsButton = screen.getAllByAltText('Options')[0].closest('button');
    fireEvent.click(optionsButton!);

    const deleteMenu = screen.getAllByText('Delete Team Member')[0];
    expect(deleteMenu).toBeInTheDocument();

    fireEvent.click(deleteMenu);

    expect(mockOnOpenDeleteModal).toHaveBeenCalledWith(mockMembers[0]);
  });
});
