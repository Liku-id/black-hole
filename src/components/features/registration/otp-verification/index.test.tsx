import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act, fireEvent, render, screen } from '@testing-library/react';

import OTPVerificationForm from './index';

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

const theme = createTheme();

jest.mock('@/components/common', () => ({
  Button: (props: any) => (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  ),
  Body2: ({ children }: any) => <div>{children}</div>,
  H3: ({ children }: any) => <h3>{children}</h3>
}));

describe('OTPVerificationForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnResend = jest.fn();
  const defaultProps = {
    phoneNumber: '+6281234567890',
    onSubmit: mockOnSubmit,
    onResendOTP: mockOnResend,
    isLoading: false,
    expiredAt: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders masked phone number and 6 OTP inputs', () => {
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('Verify Your Account')).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\*\*\*\*890/)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('handles OTP input, ignores invalid/multi-char values, navigates with keys, and auto-submits', () => {
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} />
      </ThemeProvider>
    );

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];

    // Ignore non-numeric or multi-digit direct input
    fireEvent.change(inputs[0], { target: { value: 'abc' } });
    expect(inputs[0].value).toBe('');
    fireEvent.change(inputs[0], { target: { value: '12' } });
    expect(inputs[0].value).toBe('');

    // Keyboard navigation: ArrowRight, ArrowLeft, Backspace on empty input
    inputs[0].focus();
    fireEvent.keyDown(inputs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[1]);

    fireEvent.keyDown(inputs[1], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(inputs[0]);

    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);

    // Enter all 6 digits -> triggers auto-submit
    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });

  it('handles countdown timer, manual verify submit, and resend OTP', () => {
    const expiredAt = new Date(Date.now() + 2000).toISOString();
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} expiredAt={expiredAt} />
      </ThemeProvider>
    );

    const actionBtn = screen.getByRole('button', { name: 'Verify' });
    expect(actionBtn).toBeDisabled();

    // Fill 6 digits via partial paste at 0 and manual input at 0..4 to verify manual button click
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 5; i++) {
      fireEvent.change(inputs[i], { target: { value: '9' } });
    }
    fireEvent.change(inputs[5], { target: { value: '8' } });
    expect(actionBtn).toBeEnabled();
    fireEvent.click(actionBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('999998');

    // Expire countdown to enable Resend
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(actionBtn).toHaveTextContent('Resend');
    expect(actionBtn).toBeEnabled();
    fireEvent.click(actionBtn);
    expect(mockOnResend).toHaveBeenCalledTimes(1);
  });

  it('handles full and partial paste and loading states', () => {
    const expiredAt = new Date(Date.now() + 65000).toISOString();
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm
          {...defaultProps}
          expiredAt={expiredAt}
          isLoading={false}
        />
      </ThemeProvider>
    );
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];

    // Partial paste from index 1 -> does not auto-submit
    fireEvent.paste(inputs[1], {
      clipboardData: { getData: () => 'ab45' },
      preventDefault: jest.fn()
    });
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(inputs[1].value).toBe('4');
    expect(inputs[2].value).toBe('5');
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Full paste from index 0 -> auto-submits
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: jest.fn()
    });
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(mockOnSubmit).toHaveBeenCalledWith('123456');

    // Loading state with Verifying...
    rerender(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm
          {...defaultProps}
          expiredAt={expiredAt}
          isLoading={true}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Verifying...')).toBeInTheDocument();

    // Loading state with Resending...
    rerender(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm
          {...defaultProps}
          expiredAt={null}
          isLoading={true}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Resending...')).toBeInTheDocument();
  });
});
