import {
  alpha,
  Box,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  styled
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Image from 'next/image';

import {
  TextField,
  Button,
  Body2,
  Caption,
  DropzoneLite,
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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([
    { id: '1', platform: 'tiktok', url: '', icon: '/icon/tiktok.svg' },
    { id: '2', platform: 'instagram', url: '', icon: '/icon/instagram.svg' },
    { id: '3', platform: 'x', url: '', icon: '/icon/twitter.svg' }
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

  const handleProfilePictureChange = (files: File[]) => {
    if (files.length > 0) {
      setProfilePicture(files[0]);
    }
  };

  const handleSocialMediaChange = (index: number, value: string) => {
    const newLinks = [...socialMediaLinks];
    newLinks[index].url = value;
    setSocialMediaLinks(newLinks);
  };

  const removeSocialMediaLink = (index: number) => {
    const newLinks = [...socialMediaLinks];
    newLinks[index].url = '';
    setSocialMediaLinks(newLinks);
  };

  const handleSubmit = (data: any) => {
    const formData: RegisterProfileRequest = {
      profilePicture: profilePicture || undefined,
      socialMedia: socialMediaLinks.filter((link) => link.url.trim() !== ''),
      address: data.address,
      aboutOrganizer: data.aboutOrganizer,
      termsAccepted: data.termsAccepted
    };
    onSubmit(formData);
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
              Welcome,
            </H3>
            <Body2 color="text.secondary">
              Ready to take your events to the next level? Join our platform
              now!
            </Body2>
          </Box>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  {/* Profile Picture */}
                  <Box mb={3}>
                    <Body2 color="text.primary" mb={1} display="block">
                      Profile Picture
                    </Body2>
                    <DropzoneLite
                      onFileSelect={(file) =>
                        handleProfilePictureChange([file])
                      }
                      accept={{
                        'image/*': ['.jpeg', '.jpg', '.png']
                      }}
                      maxSize={2 * 1024 * 1024} // 2MB
                      height={44}
                      width="100%"
                    ></DropzoneLite>
                  </Box>

                  {/* Social Media */}
                  <Box mb={3}>
                    <Body2 color="text.primary" mb={2} display="block">
                      Social media
                    </Body2>
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
                          size="small"
                          sx={{
                            width: '100%',
                            maxWidth: '100%'
                          }}
                          startComponent={
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              width={24}
                              height={24}
                              fontSize="16px"
                            >
                              <Image
                                src={link.icon}
                                alt={link.platform}
                                width={24}
                                height={24}
                              />
                            </Box>
                          }
                          endComponent={
                            link.url !== '' && (
                              <IconButton
                                size="small"
                                onClick={() => removeSocialMediaLink(index)}
                                color="error"
                              >
                                <Image
                                  src="/icon/trash.svg"
                                  alt="Delete"
                                  width={24}
                                  height={24}
                                />
                              </IconButton>
                            )
                          }
                        />
                      </Box>
                    ))}
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  {/* Address */}
                  <Box mb={3}>
                    <Body2 color="text.primary" mb={1} display="block">
                      Address
                    </Body2>
                    <TextField
                      fullWidth
                      name="address"
                      placeholder="Address"
                      rules={{ required: 'Address is required' }}
                    />
                  </Box>

                  {/* About Organizer */}
                  <Box mb={3}>
                    <Body2 color="text.primary" mb={2} display="block">
                      About Organizer
                    </Body2>
                    <TextField
                      fullWidth
                      name="aboutOrganizer"
                      placeholder="Max 1000 Characters"
                      rules={{
                        required: 'About organizer is required',
                        maxLength: {
                          value: 1000,
                          message: 'Maximum 1000 characters allowed'
                        }
                      }}
                      inputProps={{
                        style: {
                          height: '110px',
                          padding: '0'
                        }
                      }}
                      multiline
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '160px'
                        },
                        '& .MuiInputBase-input': {
                          height: '163px !important',
                          minHeight: '163px',
                          maxHeight: '163px'
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Terms and Conditions */}
              <Box
                mt={4}
                mb={4}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FormControlLabel
                  sx={{ m: '0px' }}
                  control={
                    <Controller
                      name="termsAccepted"
                      rules={{
                        required: 'You must accept the terms and conditions'
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
                      sx={{
                        maxWidth: '315px'
                      }}
                    >
                      <Caption color="text.primary">I agree to the </Caption>
                      <Caption
                        color="primary.main"
                        sx={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: 500
                        }}
                      >
                        terms and conditions
                      </Caption>
                      <Caption color="text.primary"> and </Caption>
                      <Caption
                        color="primary.main"
                        sx={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: 500
                        }}
                      >
                        privacy policy
                      </Caption>
                      <Caption color="text.primary">
                        applicable at Wukong
                      </Caption>
                    </Box>
                  }
                />
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
                {isLoading ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      size={20}
                      sx={{ mr: 1 }}
                    />
                    Processing...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </ProfileCard>
    </Box>
  );
};

export default RegisterProfileForm;
