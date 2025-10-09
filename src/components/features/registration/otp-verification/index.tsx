import {
  alpha,
  Box,
  Card,
  CardContent,
  CircularProgress,
  styled,
  Typography
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

const LogoWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing(3)};
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
  countdown?: number;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  phoneNumber,
  onSubmit,
  onResendOTP,
  isLoading = false,
  countdown = 180 // 5 minutes in seconds
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
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
      setTimeLeft(countdown);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear OTP input fields
    }
  };

  const maskedPhoneNumber = phoneNumber.replace(
    /(\+62\s*\d{2})(\d{3})(\d{3})(\d{3})/,
    '$1*******$4'
  );

  return (
    <Box>
      <LogoWrapper>
        <Image
          alt="Wukong Creator Logo"
          height={48}
          src="/logo/wukong.svg"
          width={176}
        />
      </LogoWrapper>

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
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
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
    </Box>
  );
};

export default OTPVerificationForm;
