import { render, screen, fireEvent } from '@testing-library/react';
import { AddTeamMemberModal } from './index';

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
}));

describe('AddTeamMemberModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    onBack: mockOnBack,
    loading: false,
    success: false,
  };

  it('renders confirmation state correctly', () => {
    render(<AddTeamMemberModal {...defaultProps} />);
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    expect(screen.getByText('Are you sure want to add this new team member?')).toBeInTheDocument();
    expect(screen.getByText('Yes, Add Team Member')).toBeInTheDocument();
  });

  it('renders success state correctly', () => {
    render(<AddTeamMemberModal {...defaultProps} success={true} />);
    
    expect(screen.getByText('Team Member Created!')).toBeInTheDocument();
    expect(screen.getByText(/check your/i)).toBeInTheDocument(); // partial match for bold text
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('calls onConfirm when clicked', () => {
    render(<AddTeamMemberModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Yes, Add Team Member'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
