import { Alert, Snackbar } from '@mui/material';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <Snackbar
        key={toast.message + toast.severity + toast.open}
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
        {toast.severity === 'success' &&
        toast.message.toLowerCase().includes('ticket redeemed') ? (
          <Alert
            icon={false}
            severity="success"
            sx={{
              width: '100%',
              backgroundColor: 'primary.main',
              borderRadius: '24px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              px: 3,
              py: 0.75,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            variant="filled"
          >
            Ticket Redeemed
          </Alert>
        ) : (
          <Alert
            severity={toast.severity}
            sx={{ width: '100%' }}
            variant="filled"
            onClose={handleClose}
          >
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </ToastContext.Provider>
  );
};
