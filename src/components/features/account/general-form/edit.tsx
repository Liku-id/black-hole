import { Box, Grid, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  TextField,
  TextArea,
  Button,
  Overline,
  Body2
} from '@/components/common';
import { EventOrganizer } from '@/types/organizer';
import { assetsService } from '@/services';
import Image from 'next/image';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  tiktok: string;
  instagram: string;
  twitter: string;
  aboutOrganizer: string;
  profilePicture: File | null;
}

interface OrganizerEditFormProps {
  eventOrganizer: EventOrganizer;
  onSubmit?: (data: any) => void;
  error?: string;
  loading?: boolean;
}

// Helper function to convert API data to form format
const convertEventOrganizerToForm = (
  organizer: EventOrganizer
): Partial<FormData> => {
  let tiktok = '';
  let instagram = '';
  let twitter = '';

  if (organizer.social_media_url) {
    try {
      const socialMediaObj = JSON.parse(organizer.social_media_url);
      tiktok = socialMediaObj.tiktok || '';
      instagram = socialMediaObj.instagram || '';
      twitter = socialMediaObj.twitter || '';
    } catch (error) {
      console.warn('Failed to parse social_media_url:', error);
    }
  }

  return {
    name: organizer.name || '',
    email: organizer.email || '',
    phoneNumber: organizer.phone_number || '',
    address: organizer.address || '',
    tiktok,
    instagram,
    twitter,
    aboutOrganizer: organizer.description || '',
    profilePicture: null
  };
};

export const OrganizerEditForm = ({
  eventOrganizer,
  onSubmit,
  error,
  loading = false
}: OrganizerEditFormProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const methods = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      tiktok: '',
      instagram: '',
      twitter: '',
      aboutOrganizer: '',
      profilePicture: null
    }
  });

  const { watch, setValue, handleSubmit } = methods;
  const watchedProfilePicture = watch('profilePicture');
  const watchedTiktok = watch('tiktok');
  const watchedInstagram = watch('instagram');
  const watchedTwitter = watch('twitter');

  // Initialize form with organizer data
  useEffect(() => {
    const formData = convertEventOrganizerToForm(eventOrganizer);

    // Set initial image preview from existing asset (only if no user interaction yet)
    if (eventOrganizer.asset?.url && !hasUserInteracted) {
      setImagePreview(eventOrganizer.asset.url);
    }

    // Set form values
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'profilePicture') {
        setValue(key as keyof FormData, value as any);
      }
    });
  }, [eventOrganizer, setValue, hasUserInteracted]);

  const handleImageUpload = (file: File) => {
    // Mark that user has interacted
    setHasUserInteracted(true);

    // Clear any existing preview first
    setImagePreview(null);

    // Set the file and create new preview
    setValue('profilePicture', file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    // Mark that user has interacted
    setHasUserInteracted(true);

    setValue('profilePicture', null);
    setImagePreview(null);

    // Clear the file input
    const fileInput = document.getElementById(
      'profile-picture-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Helper function to get display text for profile picture
  const getProfilePictureDisplayText = () => {
    // If user has selected a new file, show file name
    if (watchedProfilePicture && watchedProfilePicture instanceof File) {
      return watchedProfilePicture.name;
    }

    // If there's an existing asset from backend, show filename from key
    if (eventOrganizer.asset?.key && !hasUserInteracted) {
      const keyParts = eventOrganizer.asset.key.split('/');
      const filename = keyParts[keyParts.length - 1];
      return filename;
    }

    // Default text
    return 'max 2 MB • File type: .jpeg / .jpg / .png';
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      let finalAssetId = eventOrganizer.asset_id; // Default to existing asset_id

      // Check if image has changed (new file uploaded)
      if (data.profilePicture) {
        // Upload new image first
        setUploadingImage(true);
        try {
          const uploadResponse = await assetsService.uploadAsset(
            data.profilePicture
          );
          finalAssetId = uploadResponse.body.asset.id;
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          setUploadingImage(false);
          return; // Stop submission if upload fails
        } finally {
          setUploadingImage(false);
        }
      }

      // Convert social media fields to JSON string
      const socialMediaObj: Record<string, string> = {};
      if (data.tiktok.trim()) socialMediaObj.tiktok = data.tiktok.trim();
      if (data.instagram.trim())
        socialMediaObj.instagram = data.instagram.trim();
      if (data.twitter.trim()) socialMediaObj.twitter = data.twitter.trim();

      const payload = {
        name: data.name,
        description: data.aboutOrganizer,
        social_media_url: JSON.stringify(socialMediaObj),
        address: data.address,
        asset_id: finalAssetId,
        organizer_type: eventOrganizer.organizer_type // Include organizer_type from existing data
      };

      if (onSubmit) {
        onSubmit(payload);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organizer Name*"
                  name="name"
                  placeholder="Your organizer name"
                  rules={{
                    required: 'Organizer name is required'
                  }}
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: 'grey.100',
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number*"
                  name="phoneNumber"
                  placeholder="Your phone number"
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: 'grey.100',
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>

              {/* Social Media */}
              <Grid item xs={12}>
                <Box>
                  <Body2 color="text.primary" mb={1}>
                    Social Media*
                  </Body2>

                  {/* TikTok */}
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label=""
                      name="tiktok"
                      placeholder="https://www.tiktok.com/@username"
                      startComponent={
                        <Box display="flex" alignItems="center" gap={1} px={1}>
                          <Image
                            src="/icon/tiktok.svg"
                            alt="TikTok"
                            width={20}
                            height={20}
                          />
                        </Box>
                      }
                      endComponent={
                        watchedTiktok && watchedTiktok.trim() ? (
                          <IconButton onClick={() => setValue('tiktok', '')}>
                            <Image
                              src="/icon/trash.svg"
                              alt="trash icon"
                              width={20}
                              height={20}
                            />
                          </IconButton>
                        ) : null
                      }
                    />
                  </Box>

                  {/* Instagram */}
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label=""
                      name="instagram"
                      placeholder="https://www.instagram.com/username"
                      startComponent={
                        <Box display="flex" alignItems="center" gap={1} px={1}>
                          <Image
                            src="/icon/instagram.svg"
                            alt="Instagram"
                            width={20}
                            height={20}
                          />
                        </Box>
                      }
                      endComponent={
                        watchedInstagram && watchedInstagram.trim() ? (
                          <IconButton onClick={() => setValue('instagram', '')}>
                            <Image
                              src="/icon/trash.svg"
                              alt="trash icon"
                              width={20}
                              height={20}
                            />
                          </IconButton>
                        ) : null
                      }
                    />
                  </Box>

                  {/* Twitter */}
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label=""
                      name="twitter"
                      placeholder="https://twitter.com/username"
                      startComponent={
                        <Box display="flex" alignItems="center" gap={1} px={1}>
                          <Image
                            src="/icon/twitter.svg"
                            alt="Twitter"
                            width={20}
                            height={20}
                          />
                        </Box>
                      }
                      endComponent={
                        watchedTwitter && watchedTwitter.trim() ? (
                          <IconButton onClick={() => setValue('twitter', '')}>
                            <Image
                              src="/icon/trash.svg"
                              alt="trash icon"
                              width={20}
                              height={20}
                            />
                          </IconButton>
                        ) : null
                      }
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextArea
                  fullWidth
                  label="About Organizer*"
                  name="aboutOrganizer"
                  placeholder="Tell us about your organizer"
                  rules={{
                    required: 'About organizer is required'
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address*"
                  name="email"
                  placeholder="your@email.com"
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: 'grey.100',
                      borderRadius: 1
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address*"
                  name="address"
                  placeholder="Your address"
                  rules={{
                    required: 'Address is required'
                  }}
                />
              </Grid>

              {/* Profile Picture */}
              <Grid item xs={12}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Body2 color="text.primary">Profile Picture* </Body2>
                    <Overline sx={{ color: 'text.secondary' }}>
                      This will use as a creator logo
                    </Overline>
                  </Box>

                  <Box
                    border="1px solid"
                    borderColor="primary.main"
                    borderRadius={1}
                    p="0px 16px"
                    sx={{
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: 43
                    }}
                  >
                    <Body2 color="text.secondary">
                      {getProfilePictureDisplayText()}
                    </Body2>

                    {imagePreview ? (
                      <IconButton size="small" onClick={handleImageRemove}>
                        <Image
                          src="/icon/close.svg"
                          alt="remove icon"
                          width={20}
                          height={20}
                        />
                      </IconButton>
                    ) : (
                      <IconButton component="label" disabled={uploadingImage}>
                        <Image
                          src="/icon/upload.svg"
                          alt="upload icon"
                          width={24}
                          height={24}
                        />
                        <input
                          id="profile-picture-upload"
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </IconButton>
                    )}
                  </Box>

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      style={{
                        maxHeight: '100px',
                        height: 'auto',
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        marginTop: '8px'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box marginTop={4} textAlign="right">
          {error && (
            <Box marginBottom={2}>
              <Overline color="error.main">{error}</Overline>
            </Box>
          )}

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Saving...' : 'Save Data'}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};
