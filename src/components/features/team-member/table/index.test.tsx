import { render, screen, fireEvent } from '@testing-library/react';

import { TeamMemberTable } from './index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
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
      // other props...
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      role: { name: 'finance' },
      status: 'active'
    },
  ];

  const defaultProps = {
    teamMembers: mockMembers as any,
    loading: false,
    currentPage: 0,
    pageSize: 10,
    total: 2,
    onPageChange: mockOnPageChange,
    onOpenDeleteModal: mockOnOpenDeleteModal,
  };

  it('renders table with data', () => {
    render(<TeamMemberTable {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ground Staff')).toBeInTheDocument();
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('opens options menu and clicks delete', () => {
    render(<TeamMemberTable {...defaultProps} />);
    
    // Find action button for first row
    const actionButtons = screen.getAllByRole('button'); 
    // Usually IconButton has button role.
    // Click the first one.
    fireEvent.click(actionButtons[0]);
    
    // Check for "Delete Team Member" menu item
    const deleteMenu = screen.getByText('Delete Team Member');
    expect(deleteMenu).toBeInTheDocument();
    
    // Click delete
    fireEvent.click(deleteMenu);
    
    expect(mockOnOpenDeleteModal).toHaveBeenCalledWith(mockMembers[0]);
  });
});
