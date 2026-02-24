import { render, screen, fireEvent } from '@testing-library/react';

import { DeleteTeamMemberModal } from './index';

jest.mock('@/components/common', () => ({
    Modal: ({ children, title, open, footer }: any) => open ? (
        <div role="dialog">
            <h2>{title}</h2>
            {children}
            <footer>{footer}</footer>
        </div>
    ) : null,
    Button: (props: any) => <button {...props}>{props.children}</button>,
    Body2: ({ children }: any) => <p>{children}</p>,
    Overline: ({ children }: any) => <span>{children}</span>,
}));

describe('DeleteTeamMemberModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    loading: false,
  };

  it('renders correctly', () => {
    render(<DeleteTeamMemberModal {...defaultProps} />);
    
    expect(screen.getByText('Delete Team Member')).toBeInTheDocument();
    expect(screen.getByText('Are you sure want to delete this new team member?')).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
  });

  it('calls onConfirm when clicked', () => {
    render(<DeleteTeamMemberModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Yes, Delete'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
