import {
  alpha,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  styled
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';

import {
  TextField,
  TextArea,
  Button,
  Body2,
  Caption,
  H3
} from '@/components/common';
import { RegisterProfileRequest, SocialMediaLink } from '@/types/register';

const ProfileCard = styled(Card)(
  ({ theme }) => `
      width: 100%;
      max-width: 800px;
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

interface RegisterProfileFormProps {
  onSubmit: (data: RegisterProfileRequest) => void;
  isLoading?: boolean;
}

const RegisterProfileForm: React.FC<RegisterProfileFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([
    { id: '1', platform: 'tiktok', url: '', icon: '/icon/tiktok.svg' },
    { id: '2', platform: 'instagram', url: '', icon: '/icon/instagram.svg' },
    { id: '3', platform: 'twitter', url: '', icon: '/icon/twitter.svg' }
  ]);

  const methods = useForm<RegisterProfileRequest>({
    defaultValues: {
      socialMedia: [],
      address: '',
      aboutOrganizer: '',
      termsAccepted: false
    },
    mode: 'onChange'
  });

  const handleSocialMediaChange = (index: number, value: string) => {
    const newLinks = [...socialMediaLinks];
    newLinks[index].url = value;
    setSocialMediaLinks(newLinks);

    // Clear social media error if at least one link is filled
    const hasFilledLink = newLinks.some((link) => link.url.trim() !== '');
    if (hasFilledLink && methods.formState.errors.socialMedia) {
      methods.clearErrors('socialMedia');
    }
  };

  const removeSocialMediaLink = (index: number) => {
    const newLinks = [...socialMediaLinks];
    newLinks[index].url = '';
    setSocialMediaLinks(newLinks);

    // Check if any links are still filled after clearing this one
    const hasFilledLink = newLinks.some((link) => link.url.trim() !== '');
    if (!hasFilledLink && methods.formState.errors.socialMedia) {
      // Keep the error if no links are filled
    } else if (hasFilledLink && methods.formState.errors.socialMedia) {
      // Clear error if at least one link is still filled
      methods.clearErrors('socialMedia');
    }
  };

  const handleSubmit = (data: any) => {
    // Validate that at least one social media link is provided
    const filledSocialMedia = socialMediaLinks.filter(
      (link) => link.url.trim() !== ''
    );
    if (filledSocialMedia.length === 0) {
      methods.setError('socialMedia', {
        type: 'required',
        message: 'At least one social media link is required'
      });
      return;
    }

    const formData: RegisterProfileRequest = {
      socialMedia: filledSocialMedia,
      address: data.address,
      aboutOrganizer: data.aboutOrganizer,
      termsAccepted: data.termsAccepted
    };
    onSubmit(formData);
  };

  // Custom validation function for social media
  const validateSocialMedia = () => {
    const filledSocialMedia = socialMediaLinks.filter(
      (link) => link.url.trim() !== ''
    );
    if (filledSocialMedia.length === 0) {
      methods.setError('socialMedia', {
        type: 'required',
        message: 'At least one social media link is required'
      });
      return false;
    }
    return true;
  };

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

      <ProfileCard elevation={6}>
        <CardContent sx={{ p: 0, pb: '0px !important' }}>
          <Box mb={5} textAlign={'center'}>
            <H3 gutterBottom color="text.primary" fontWeight={700}>
              Complete Your Profile
            </H3>
            <Body2 color="text.secondary">
              Tell us more about yourself and your organization
            </Body2>
          </Box>

          <FormProvider {...methods}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                // Trigger all form validations first
                const isValid = await methods.trigger();

                // Then validate social media
                const socialMediaValid = validateSocialMedia();

                // Only proceed if all validations pass
                if (isValid && socialMediaValid) {
                  methods.handleSubmit(handleSubmit)(e);
                }
              }}
            >
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  {/* Address */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      name="address"
                      label="Address *"
                      placeholder="Address"
                      rules={{ required: 'Address is required' }}
                    />
                  </Box>

                  {/* Social Media */}
                  <Box mb={3}>
                    <Body2 color="text.primary" mb={1} display="block">
                      Social media *
                    </Body2>
                    {methods.formState.errors.socialMedia && (
                      <Caption color="error.main" mb={1} display="block">
                        {methods.formState.errors.socialMedia.message}
                      </Caption>
                    )}
                    {socialMediaLinks.map((link, index) => (
                      <Box
                        key={link.id}
                        alignItems="center"
                        mb={2}
                        gap={1}
                        width="100%"
                      >
                        <TextField
                          fullWidth
                          placeholder="Link Profile Account"
                          value={link.url}
                          onChange={(e) =>
                            handleSocialMediaChange(index, e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width={24}
                                height={24}
                                mr={1}
                              >
                                <Image
                                  src={link.icon}
                                  alt={link.platform}
                                  width={24}
                                  height={24}
                                />
                              </Box>
                            ),
                            endAdornment: link.url !== '' && (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width={24}
                                height={24}
                                ml={1}
                                sx={{ cursor: 'pointer' }}
                                onClick={() => removeSocialMediaLink(index)}
                              >
                                <Image
                                  src="/icon/trash.svg"
                                  alt="Delete"
                                  width={24}
                                  height={24}
                                />
                              </Box>
                            )
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  {/* About Organizer */}
                  <Box mb={3}>
                    <TextArea
                      label="About Organizer *"
                      fullWidth
                      name="aboutOrganizer"
                      placeholder="Max 1000 Characters"
                      rules={{
                        required: 'About organizer is required'
                      }}
                      maxLength={1000}
                      height="260px"
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Terms and Conditions */}
              <Box
                mt={4}
                mb={4}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <FormControlLabel
                  sx={{ m: '0px' }}
                  control={
                    <Controller
                      name="termsAccepted"
                      rules={{
                        required:
                          'You must accept the terms and conditions and privacy policy'
                      }}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={!!field.value}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label={
                    <Box
                      display="flex"
                      flexDirection="row"
                      flexWrap="wrap"
                      alignItems="center"
                      gap={0.5}
                      maxWidth="315px"
                    >
                      <Caption color="text.primary">I agree to the </Caption>
                      <Link
                        href="/terms-and-conditions"
                        target="_blank"
                        passHref
                      >
                        <Caption
                          color="primary.main"
                          fontWeight={500}
                          sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          terms and conditions
                        </Caption>
                      </Link>
                      <Caption color="text.primary"> and </Caption>
                      <Link href="/privacy-policy" target="_blank" passHref>
                        <Caption
                          color="primary.main"
                          fontWeight={500}
                          sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          privacy policy
                        </Caption>
                      </Link>
                      <Caption color="text.primary">
                        applicable at Wukong
                      </Caption>
                    </Box>
                  }
                />
                {methods.formState.errors.termsAccepted && (
                  <Caption
                    color="error.main"
                    mt={1}
                    display="block"
                    textAlign="center"
                  >
                    {methods.formState.errors.termsAccepted.message}
                  </Caption>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                disabled={isLoading}
                sx={{
                  width: '322px',
                  height: '48px',
                  margin: '0 auto',
                  display: 'block'
                }}
                type="submit"
              >
                {isLoading ? 'Processing...' : 'Sign Up'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </ProfileCard>
    </Box>
  );
};

export default RegisterProfileForm;
