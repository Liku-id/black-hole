import { Box, Container, Grid, styled } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import RegisterForm from '@/components/features/registration/form';
import RegisterProfileForm from '@/components/features/registration/profile-form';
import OTPVerificationForm from '@/components/features/registration/otp-verification';
import RegistrationContent from '@/components/features/registration/registration-content';
import FeaturesSection from '@/components/features/registration/features-section';
import StripeText from '@/components/common/stripe-text';
import Footer from '@/components/common/footer';
import { RegisterRequest, RegisterProfileRequest } from '@/types/register';
import { registerService } from '@/services/auth/register';
import { useToast } from '@/contexts/ToastContext';
import { withAuth } from '@/components/Auth/withAuth';
import { utmService } from '@/services/utm';
import { dateUtils, deviceUtils } from '@/utils';

const LogoWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing(3)};
  `
);

const Register: NextPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [registrationData, setRegistrationData] =
    useState<RegisterRequest | null>(null);
  const [profileData, setProfileData] = useState<RegisterProfileRequest | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiredAt, setOtpExpiredAt] = useState<string | null>(null);

  const router = useRouter();
  const { showInfo, showError } = useToast();

  const handleBasicInfoSubmit = (data: RegisterRequest) => {
    setRegistrationData(data);
    setPhoneNumber(data.phoneNumber);
    setActiveStep(1);
  };

  const handleProfileSubmit = async (data: RegisterProfileRequest) => {
    try {
      setIsLoading(true);
      setProfileData(data);

      const otpResponse = await registerService.requestOTP({
        phoneNumber: phoneNumber
      });

      setOtpExpiredAt(otpResponse.expiredAt);
      setActiveStep(2);
      showInfo('OTP sent successfully!');
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

      const otpResponse = await registerService.verifyOTP({
        phoneNumber,
        code: otp
      });

      if (otpResponse.success) {
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

        await registerService.createEventOrganizer({
          name: registrationData!.organizerName,
          email: registrationData!.email,
          phone_number: registrationData!.phoneNumber,
          password: registrationData!.password,
          social_media_url: socialMediaUrl,
          address: profileData!.address,
          description: profileData!.aboutOrganizer
        });

        // Send UTM data if available from URL params
        const query = router.query;
        const utmSource = query.utm_source as string;
        const utmMedium = query.utm_medium as string;
        const utmCampaign = query.utm_campaign as string;

        if (utmSource && utmMedium && utmCampaign) {
          const utmPayload = {
            action: 'register',
            campaign: utmCampaign,
            email: registrationData!.email,
            fullName: registrationData!.organizerName,
            medium: utmMedium,
            phoneNumber: registrationData!.phoneNumber,
            platform: deviceUtils.getDevicePlatform(),
            source: utmSource,
            timestamp: dateUtils.getTodayWIB().toISOString(),
          };
          await utmService.sendUtmData(utmPayload);
        }

        showInfo('Registrasi berhasil diselesaikan!');
        router.push('/login');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const otpResponse = await registerService.requestOTP({
        phoneNumber
      });
      setOtpExpiredAt(otpResponse.expiredAt);
      showInfo('OTP resent successfully!');
    } catch (error) {
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
            expiredAt={otpExpiredAt}
          />
        );
      default:
        return <RegisterForm onSubmit={handleBasicInfoSubmit} />;
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={{ xs: "24px 0px", md: "96px 0px" }}
      bgcolor="primary.dark"
      overflow="hidden"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex={1}
        width="100%"
      >
        <Container maxWidth="lg" >
          <LogoWrapper>
            <Image
              alt="Wukong Creator Logo"
              height={48}
              src="/logo/wukong.svg"
              width={176}
            />
          </LogoWrapper>

          {activeStep === 0 ? (
            <>
              <Grid container spacing={4} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <RegistrationContent />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    {renderStepContent()}
                  </Box>
                </Grid>
              </Grid>

              <Box mt="100px" mb="80px">
                <FeaturesSection />
              </Box>

              <Box
                width="100vw"
                position="relative"
                left="50%"
                marginTop="0"
                sx={{ transform: 'translateX(-50%)' }}
              >
                <StripeText
                  direction="horizontal"
                  scrollDirection="left-to-right"
                />
              </Box>

              <Footer />

            </>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              {renderStepContent()}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

// Export with authentication wrapper that excludes register from auth requirements
export default withAuth(Register, { requireAuth: false });
