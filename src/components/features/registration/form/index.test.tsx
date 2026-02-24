import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegisterForm from './index';

// Mock Dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockShowError = jest.fn();
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: mockShowError,
  }),
}));

const mockCheckAvailability = jest.fn();
jest.mock('@/services/auth/register', () => ({
  registerService: {
    checkAvailability: (...args: any) => mockCheckAvailability(...args),
  },
}));

jest.mock('@/utils/validationUtils', () => ({
  validationUtils: {
    organizerNameValidator: () => true,
    emailValidator: () => true,
    phoneNumberValidator: () => true,
    passwordValidator: () => true,
    confirmPasswordValidator: (val: string, pass: string) => val === pass || 'Passwords do not match',
  },
}));

jest.mock('@/components/common', () => {
    const { useFormContext } = require('react-hook-form');
    return {
        Button: (props: any) => <button type={props.type} onClick={props.onClick} disabled={props.disabled}>{props.children}</button>,
        TextField: ({ name, label, placeholder, rules, type }: any) => {
            const { register, formState: { errors } } = useFormContext();
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />
                    {errors[name] && <span>{errors[name].message}</span>}
                </div>
            );
        },
        PhoneField: ({ name, label, placeholder, rules, type }: any) => {
            const { register, formState: { errors } } = useFormContext();
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />
                    {errors[name] && <span>{errors[name].message}</span>}
                </div>
            );
        },
        H2: ({ children }: any) => <h2>{children}</h2>,
        Body2: ({ children }: any) => <div>{children}</div>,
        Caption: ({ children }: any) => <span>{children}</span>,
    };
});

const theme = createTheme();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    expect(screen.getByLabelText(/Organizer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument(); // PhoneField might have different label structure, but 'Phone Number' text should be there
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('validates passwords match', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    // Fill form
    await userEvent.type(screen.getByLabelText(/Organizer Name/i), 'Test Org');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    // Phone input might need specific handling if it's a complex component.
    // Assuming it has an input.
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    await userEvent.type(phoneInput, '8123456789');

    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'PasswordMismatch');
    
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('submits when availability check passes', async () => {
    mockCheckAvailability.mockResolvedValue({ body: { isValid: true } });

    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    await userEvent.type(screen.getByLabelText(/Organizer Name/i), 'Test Org');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Phone Number/i), '8123456789');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    await waitFor(() => {
        expect(mockCheckAvailability).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows error when availability check fails', async () => {
    mockCheckAvailability.mockResolvedValue({ 
        body: { isValid: false },
        message: 'email is already registered'
    });

    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    // Fill minimal valid form
    await userEvent.type(screen.getByLabelText(/Organizer Name/i), 'Test Org');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Phone Number/i), '8123456789');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'Password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('This email is already registered');
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
