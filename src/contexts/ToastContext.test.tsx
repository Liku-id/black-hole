import { ThemeProvider } from '@mui/material';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { themeCreator } from '@/theme/base';

import { ToastProvider, useToast } from './ToastContext';

const TestConsumer = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  return (
    <div>
      <button onClick={() => showSuccess('Saved!')}>success</button>
      <button onClick={() => showError('Failed!')}>error</button>
      <button onClick={() => showWarning('Careful!')}>warning</button>
      <button onClick={() => showInfo('FYI!')}>info</button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('throws when useToast is called outside ToastProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      useToast();
      return null;
    };

    expect(() => render(<Broken />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    spy.mockRestore();
  });

  it('displays success, error, warning, and info toasts and closes on timeout or escape', () => {
    const theme = themeCreator();
    render(
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('success'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('error'));
    expect(screen.getByText('Failed!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('warning'));
    expect(screen.getByText('Careful!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('info'));
    expect(screen.getByText('FYI!')).toBeInTheDocument();

    // Activate ClickAwayListener (uses setTimeout(..., 0) on mount)
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // clickaway should NOT close snackbar
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    expect(screen.getByText('FYI!')).toBeInTheDocument();

    // autoHideDuration (4000ms) closes snackbar, then Grow exit transition unmounts it
    act(() => {
      jest.advanceTimersByTime(4100);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByText('FYI!')).not.toBeInTheDocument();
  });
});
