import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddNewRecipientModal } from './index';

// Mock Modal
// Mock Common Components
jest.mock('@/components/common', () => {
    const { useFormContext } = require('react-hook-form');
    return {
        Modal: ({ children, title, open, onClose, footer }: any) => {
            if (!open) return null;
            return (
                <div role="dialog" aria-label={title}>
                    <h2>{title}</h2>
                    <button onClick={onClose}>Close</button>
                    {children}
                    {footer}
                </div>
            );
        },
        Button: (props: any) => <button type={props.type} onClick={props.onClick} disabled={props.disabled}>{props.children}</button>,
        TextField: ({ name, label, placeholder, rules, type }: any) => {
            const { register, formState: { errors } } = useFormContext();
            const error = errors[name];
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />
                    {error && <span role="alert">{error.message as string}</span>}
                </div>
            );
        },
        Select: ({ name, label, options, rules, placeholder }: any) => {
            const { register, formState: { errors } } = useFormContext();
            const error = errors[name];
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <select id={name} {...register(name, rules)}>
                       <option value="">{placeholder}</option>
                       {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {error && <span role="alert">{error.message as string}</span>}
                </div>
            );
        },
        PhoneField: ({ name, label, placeholder, rules, type }: any) => {
            const { register, formState: { errors } } = useFormContext();
            const error = errors[name];
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />
                    {error && <span role="alert">{error.message as string}</span>}
                </div>
            );
        },
        Body2: ({ children }: any) => <div>{children}</div>,
    };
});

// Mock CustomModal
jest.mock('@/components/common/modal', () => ({
  __esModule: true,
  default: ({ children, title, open, onClose }: any) => {
    if (!open) return null;
    return (
        <div role="dialog" aria-label={title}>
            <h2>{title}</h2>
            <button onClick={onClose}>Close</button>
            {children}
        </div>
    );
  }
}));

describe('AddNewRecipientModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockTicketTypes = [
    { id: 't1', name: 'VIP' },
    { id: 't2', name: 'Regular' },
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    ticketTypes: mockTicketTypes as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in add mode', () => {
    render(<AddNewRecipientModal {...defaultProps} />);
    
    expect(screen.getByText('Add new Recipient')).toBeInTheDocument();
    expect(screen.getByText('Recipient Name*')).toBeInTheDocument();
    expect(screen.getByText(/Save Recipient/i)).toBeInTheDocument();
  });

  it('renders correctly in edit mode', () => {
    render(<AddNewRecipientModal {...defaultProps} defaultValues={{ recipientName: 'John' }} />);
    
    expect(screen.getByText('Edit Recipient')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AddNewRecipientModal {...defaultProps} />);
    
    const saveButton = screen.getByText('Save Recipient');
    await userEvent.click(saveButton);
    
    expect(await screen.findByText('Recipient Name is required')).toBeInTheDocument();
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Phone number is required')).toBeInTheDocument();
    expect(await screen.findByText('Ticket Type is required')).toBeInTheDocument();
    expect(await screen.findByText('Ticket Quantity is required')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<AddNewRecipientModal {...defaultProps} />);
    
    const emailInput = screen.getByPlaceholderText('Recipient Email');
    await userEvent.type(emailInput, 'invalid-email');
    
    const saveButton = screen.getByText('Save Recipient');
    await userEvent.click(saveButton);
    
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });
});
