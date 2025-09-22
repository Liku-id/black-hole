import { Box, Snackbar, useTheme } from '@mui/material';
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { Body2 } from '@/components/common';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showToast = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    try {
      setToast({
        open: true,
        message,
        severity
      });
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  };

  const showSuccess = (message: string) => showToast(message, 'success');
  const showError = (message: string) => showToast(message, 'error');
  const showWarning = (message: string) => showToast(message, 'warning');
  const showInfo = (message: string) => showToast(message, 'info');

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    try {
      setToast((prev) => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Error closing toast:', error);
    }
  };

  // Get background color based on severity
  const getBackgroundColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return '#3C50E0';
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return '#3C50E0';
    }
  };

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={4000}
        open={toast.open}
        sx={{
          '& .MuiSnackbar-root': {
            position: 'fixed',
            top: '20px !important'
          }
        }}
        TransitionComponent={undefined}
        onClose={handleClose}
      >
        <Box
          borderRadius="24px"
          boxShadow={`0 4px 12px rgba(0, 0, 0, 0.15)`}
          minWidth="200px"
          padding="16px 24px"
          sx={{ backgroundColor: getBackgroundColor(toast.severity) }}
          textAlign="center"
        >
          <Body2 color="white" fontWeight={500}>
            {toast.message}
          </Body2>
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  );
};
