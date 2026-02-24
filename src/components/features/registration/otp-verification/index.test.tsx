import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, fireEvent, act } from '@testing-library/react';

import OTPVerificationForm from './index';

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

const theme = createTheme();

// Mock Common Components
jest.mock('@/components/common', () => ({
  Button: (props: any) => <button onClick={props.onClick} disabled={props.disabled}>{props.children}</button>,
  Body2: ({ children }: any) => <div>{children}</div>,
  H3: ({ children }: any) => <h3>{children}</h3>,
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

  it('renders correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Verify Your Account')).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\*\*\*\*890/)).toBeInTheDocument(); // Masked phone number check
    
    // 6 inputs
    const inputs = screen.getAllByRole('textbox'); // Input type="text", inputMode="numeric"
    // Note: OTPInput is an input, styled.
    expect(inputs).toHaveLength(6);
  });

  it('handles otp input and auto submit', async () => {
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} />
      </ThemeProvider>
    );
    
    const inputs = screen.getAllByRole('textbox');
    
    for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }
    
    // Wait for the last timeout to trigger submit
    act(() => {
        jest.advanceTimersByTime(100);
    });
    
    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });

  it('handles countdown and resend', () => {
    const expiredAt = new Date(Date.now() + 2000).toISOString(); // 2 seconds from now
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} expiredAt={expiredAt} />
      </ThemeProvider>
    );
    
    const resendButton = screen.getByRole('button', { name: 'Verify' }); // Button text is Verify initially (or loading)
    // Actually Logic: 
    // if canResend -> Text "Resend"
    // else -> "Verify"
    
    // Initially canResend is false because time > 0
    expect(resendButton).toHaveTextContent('Verify');
    expect(resendButton).toBeDisabled(); // Disabled if OTP not filled
    
    // Advance time
    act(() => {
        jest.advanceTimersByTime(3000);
    });
    
    expect(resendButton).toHaveTextContent('Resend');
    expect(resendButton).toBeEnabled();
    
    fireEvent.click(resendButton);
    expect(mockOnResend).toHaveBeenCalled();
  });

  it('handles paste', () => {
    render(
      <ThemeProvider theme={theme}>
        <OTPVerificationForm {...defaultProps} />
      </ThemeProvider>
    );
    const inputs = screen.getAllByRole('textbox');

    const pasteEvent = {
      clipboardData: {
        getData: () => '123456',
      },
      preventDefault: jest.fn(),
    };

    fireEvent.paste(inputs[0], pasteEvent);

    act(() => {
        jest.advanceTimersByTime(100);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith('123456');
  });
});
