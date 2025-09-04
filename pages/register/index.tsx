import { Box, Container } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';

import RegisterForm from '@/components/features/registration/form';
import RegisterProfileForm from '@/components/features/registration/profile-form';
import OTPVerificationForm from '@/components/features/registration/otp-verification';
import { RegisterRequest, RegisterProfileRequest } from '@/types/register';
import { registerService } from '@/services/auth/register';
import { useToast } from '@/contexts/ToastContext';

const Register: NextPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationData, setRegistrationData] =
    useState<RegisterRequest | null>(null);
  const [profileData, setProfileData] = useState<RegisterProfileRequest | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiredIn, setOtpExpiredIn] = useState(300);

  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleBasicInfoSubmit = (data: RegisterRequest) => {
    setRegistrationData(data);
    setPhoneNumber(data.phoneNumber);
    setActiveStep(1);
  };

  const handleProfileSubmit = async (data: RegisterProfileRequest) => {
    try {
      setIsLoading(true);
      setProfileData(data);

      // Request OTP when moving to OTP step
      const otpResponse = await registerService.requestOTP({
        phoneNumber: phoneNumber
      });

      setOtpExpiredIn(otpResponse.expiredIn);
      setActiveStep(2);
      showSuccess('OTP sent successfully!');
    } catch (error) {
      console.error('OTP request failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send OTP';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    try {
      setIsLoading(true);

      // Verify OTP
      const otpResponse = await registerService.verifyOTP({
        phoneNumber,
        code: otp
      });

      if (otpResponse.success) {
        // Create event organizer without profile picture
        const socialMediaUrl = JSON.stringify(
          profileData!.socialMedia.reduce(
            (acc, link) => {
              if (link.url.trim()) {
                acc[link.platform] = link.url;
              }
              return acc;
            },
            {} as Record<string, string>
          )
        );

        // Pastikan asset_id disertakan sesuai kebutuhan tipe CreateEventOrganizerRequest
        await registerService.createEventOrganizer({
          name: registrationData!.organizerName,
          email: registrationData!.email,
          phone_number: registrationData!.phoneNumber,
          password: registrationData!.password,
          social_media_url: socialMediaUrl,
          address: profileData!.address,
          description: profileData!.aboutOrganizer
        });

        showSuccess('Registrasi berhasil diselesaikan!');

        // Redirect ke login setelah registrasi berhasil
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      showError(errorMessage);
      setIsLoading(false); // Only stop loading on error
    }
    // Note: Loading state continues until redirect happens
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const otpResponse = await registerService.requestOTP({
        phoneNumber
      });
      setOtpExpiredIn(otpResponse.expiredIn);
      showSuccess('OTP resent successfully!');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resend OTP';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <RegisterForm onSubmit={handleBasicInfoSubmit} />;
      case 1:
        return (
          <RegisterProfileForm
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <OTPVerificationForm
            phoneNumber={phoneNumber}
            onSubmit={handleOTPSubmit}
            onResendOTP={handleResendOTP}
            isLoading={isLoading}
            countdown={otpExpiredIn}
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
