import {
  alpha,
  Box,
  Card,
  CardContent,
  CircularProgress,
  styled,
  Typography
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

import { Button, Body2, H3 } from '@/components/common';

const OTPCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 500px;
    padding: 56px 24px;
    margin: auto;
    background: ${alpha(theme.palette.background.paper, 1)};
    backdrop-filter: blur(10px);
    border-radius: 0px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`
);

const OTPInput = styled('input')(
  ({ theme }) => `
    width: 50px;
    height: 50px;
    border: 2px solid ${theme.palette.grey[300]};
    border-radius: 8px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin: 0 8px;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: ${theme.palette.primary.main};
      box-shadow: 0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)};
    }

    &:not(:placeholder-shown) {
      border-color: ${theme.palette.primary.main};
    }
  `
);

interface OTPVerificationFormProps {
  phoneNumber: string;
  onSubmit: (otp: string) => void;
  onResendOTP: () => void;
  isLoading?: boolean;
  expiredAt?: string | null;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  phoneNumber,
  onSubmit,
  onResendOTP,
  isLoading = false,
  expiredAt
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Calculate time left from expiredAt
  const calculateTimeLeft = (expiredAtString: string | null | undefined): number => {
    if (!expiredAtString) return 0;
    
    const expiredDate = new Date(expiredAtString);
    const now = new Date();
    const diff = Math.max(0, Math.floor((expiredDate.getTime() - now.getTime()) / 1000));
    return diff;
  };

  // Update timeLeft when expiredAt changes and setup countdown timer
  useEffect(() => {
    if (!expiredAt) {
      setTimeLeft(0);
      setCanResend(true);
      return;
    }

    // Calculate initial time left
    const updateTimeLeft = () => {
      const newTimeLeft = calculateTimeLeft(expiredAt);
      setTimeLeft(newTimeLeft);
      setCanResend(newTimeLeft === 0);
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (numericValue && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }

    if (newOtp.every((digit) => digit !== '') && index === 5) {
      setTimeout(() => {
        handleSubmit(newOtp.join(''));
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); 
    const digits = pastedData.slice(0, 6).split('');

    if (digits.length > 0) {
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      const nextIndex = Math.min(index + digits.length, 5);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
        
        if (newOtp.every((digit) => digit !== '')) {
          handleSubmit(newOtp.join(''));
        }
      }, 0);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (otpString: string) => {
    if (otpString.length === 6) {
      onSubmit(otpString);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      onResendOTP();
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  const maskedPhoneNumber = phoneNumber.replace(
    /(\+62\s*\d{2})(\d{3})(\d{3})(\d{3})/,
    '$1*******$4'
  );

  return (
    <OTPCard elevation={6}>
      <CardContent sx={{ p: 0, pb: '0px !important' }}>
        <Box mb={5} textAlign={'center'}>
          <H3 gutterBottom color="text.primary" fontWeight={700}>
            Verify Your Account
          </H3>
          <Body2 color="text.secondary">
            We've sent you verification code to {maskedPhoneNumber}
          </Body2>
        </Box>

        {/* Countdown Timer */}
        <Box mb={4} textAlign="center">
          <Typography variant="body2" color="primary.main" fontWeight={700}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>

        {/* OTP Input Fields */}
        <Box mb={4} display="flex" justifyContent="center">
          {otp.map((digit, index) => (
            <OTPInput
              key={index}
              id={`otp_code_${index + 1}_field`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(e, index)}
              placeholder=""
              autoComplete="one-time-code"
              disabled={isLoading}
            />
          ))}
        </Box>

        {/* Submit Button */}
        <Box mb={3}>
          <Button
            id="btn_rgs_verify"
            disabled={
              isLoading || (!canResend && otp.some((digit) => digit === ''))
            }
            sx={{
              width: '322px',
              height: '48px',
              display: 'block',
              margin: '0 auto'
            }}
            onClick={() =>
              canResend ? handleResendOTP() : handleSubmit(otp.join(''))
            }
          >
            {isLoading ? (
              <>
                <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                {canResend ? 'Resending...' : 'Verifying...'}
              </>
            ) : canResend ? (
              `Resend`
            ) : (
              'Verify'
            )}
          </Button>
        </Box>
      </CardContent>
    </OTPCard>
  );
};

export default OTPVerificationForm;
