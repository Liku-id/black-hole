import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { registerService } from '@/services/auth/register';

import RegisterForm from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

const mockShowError = jest.fn();
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: mockShowError
  })
}));

jest.mock('@/services/auth/register', () => ({
  registerService: {
    checkAvailability: jest.fn()
  }
}));

jest.mock('@/utils/validationUtils', () => ({
  validationUtils: {
    organizerNameValidator: () => true,
    emailValidator: () => true,
    phoneNumberValidator: () => true,
    passwordValidator: () => true,
    confirmPasswordValidator: (val: string, pass: string) =>
      val === pass || 'Passwords do not match'
  }
}));

jest.mock('@/components/common', () => {
  const { useFormContext } = require('react-hook-form');
  return {
    Button: (props: any) => (
      <button
        type={props.type}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    ),
    TextField: ({ name, label, placeholder, rules, type, InputProps }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            {...register(name, rules)}
          />
          {InputProps?.endAdornment}
          {errors[name] && <span>{errors[name].message}</span>}
        </div>
      );
    },
    PhoneField: ({ name, label, placeholder, rules, type }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            {...register(name, rules)}
          />
          {errors[name] && <span>{errors[name].message}</span>}
        </div>
      );
    },
    H2: ({ children }: any) => <h2>{children}</h2>,
    Body2: ({ children }: any) => <div>{children}</div>,
    Caption: ({ children }: any) => <span>{children}</span>
  };
});

const theme = createTheme();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

const mockCheckAvailability = registerService.checkAvailability as jest.Mock;

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/Organizer Name/i), {
      target: { value: 'Test Org' }
    });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '8123456789' }
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'Password123' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123' }
    });
  };

  it('renders fields and toggles password and confirm password visibility', () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    const passInput = screen.getByLabelText(/^Password$/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    expect(passInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const toggles = screen.getAllByAltText('Toggle password visibility');
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);
    expect(passInput).toHaveAttribute('type', 'text');
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('validates passwords match and submits when availability check passes', async () => {
    mockCheckAvailability.mockResolvedValue({ body: { isValid: true } });

    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByLabelText(/Organizer Name/i), {
      target: { value: 'Test Org' }
    });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '8123456789' }
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'Password123' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Mismatch' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByText('Passwords do not match')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockCheckAvailability).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles email, phone, combined, generic, and rejected availability check errors', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    fillValidForm();

    // 1. Both email & phone unavailable
    mockCheckAvailability.mockResolvedValueOnce({
      body: { isValid: false },
      message: 'Email and Phone already taken'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Email and phone number are already registered'
      );
    });

    // 2. Email only unavailable
    mockCheckAvailability.mockResolvedValueOnce({
      body: { isValid: false },
      message: 'email already exists'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'This email is already registered'
      );
    });

    // 3. Phone only unavailable
    mockCheckAvailability.mockResolvedValueOnce({
      body: { isValid: false },
      message: 'phone already exists'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'This phone number is already registered'
      );
    });

    // 4. Generic unavailability fallback
    mockCheckAvailability.mockResolvedValueOnce({
      body: { isValid: false },
      message: 'Validation failed'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Email or phone number is not available to use'
      );
    });

    // 5. Rejected Error instance
    mockCheckAvailability.mockRejectedValueOnce(new Error('Network down'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Network down');
    });

    // 6. Rejected non-Error fallback
    mockCheckAvailability.mockRejectedValueOnce('unknown');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Availability check failed');
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
