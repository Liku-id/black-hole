import { Box, Container } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';

import RegisterForm from '@/components/Auth/RegisterForm';
import RegisterProfileForm from '@/components/Auth/RegisterProfileForm';
import OTPVerificationForm from '@/components/Auth/OTPVerificationForm';
import { RegisterRequest, RegisterProfileRequest } from '@/types/register';
import { registerService } from '@/services/auth/register';

const Register: NextPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationData, setRegistrationData] =
    useState<RegisterRequest | null>(null);
  const [profileData, setProfileData] = useState<RegisterProfileRequest | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleBasicInfoSubmit = (data: RegisterRequest) => {
    setRegistrationData(data);
    setPhoneNumber(data.phoneNumber);
    setActiveStep(1);
  };

  const handleProfileSubmit = async (data: RegisterProfileRequest) => {
    try {
      // Submit profile data and get OTP
      await registerService.submitProfile(data);
      setProfileData(data);
      setActiveStep(2);
    } catch (error) {
      console.error('Profile submission failed:', error);
      // TODO: Show error message to user
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    try {
      // Verify OTP
      const response = await registerService.verifyOTP({
        phoneNumber,
        otp
      });

      if (response.body.verified) {
        console.log('Complete registration data:', {
          registrationData,
          profileData,
          otp
        });

        // TODO: Complete final registration with all data
        // For now, redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      // TODO: Show error message to user
    }
  };

  const handleResendOTP = async () => {
    try {
      await registerService.resendOTP({ phoneNumber });
      // TODO: Show success message to user
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      // TODO: Show error message to user
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <RegisterForm onSubmit={handleBasicInfoSubmit} />;
      case 1:
        return <RegisterProfileForm onSubmit={handleProfileSubmit} />;
      case 2:
        return (
          <OTPVerificationForm
            phoneNumber={phoneNumber}
            onSubmit={handleOTPSubmit}
            onResendOTP={handleResendOTP}
          />
        );
      default:
        return <RegisterForm onSubmit={handleBasicInfoSubmit} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.dark',
        py: 3
      }}
    >
      {/* Step Content */}
      <Container maxWidth="lg">{renderStepContent()}</Container>
    </Box>
  );
};

export default Register;
