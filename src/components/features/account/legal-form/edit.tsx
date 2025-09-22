import { Box, Divider, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  TextField,
  Button,
  Body2,
  Dropzone,
  H4,
  Overline
} from '@/components/common';
import { EventOrganizer } from '@/types/organizer';
import { assetsService } from '@/services';

interface LegalEditFormProps {
  eventOrganizer: EventOrganizer;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  error?: string | null;
  loading?: boolean;
}

interface FormData {
  npwp_number: string;
  npwp_address: string;
  ktp_number: string;
  ktp_address: string;
  full_name: string;
  pic_name: string;
  pic_title: string;
}

export const LegalEditForm = ({
  eventOrganizer,
  onSubmit,
  onCancel,
  error,
  loading
}: LegalEditFormProps) => {
  const [ktpPhotoId, setKtpPhotoId] = useState<string>('');
  const [npwpPhotoId, setNpwpPhotoId] = useState<string>('');

  const isIndividual = eventOrganizer.organizer_type === 'individual';

  const methods = useForm<FormData>({
    defaultValues: {
      npwp_number: eventOrganizer.npwp || '',
      npwp_address: eventOrganizer.npwp_address || '',
      ktp_number: eventOrganizer.nik || '',
      ktp_address: eventOrganizer.ktp_address || '',
      full_name: eventOrganizer.full_name || '',
      pic_name: eventOrganizer.pic_name || '',
      pic_title: eventOrganizer.pic_title || ''
    }
  });

  const { handleSubmit } = methods;

  // Initialize photo IDs from existing data
  useEffect(() => {
    if (eventOrganizer.ktp_photo_id) {
      setKtpPhotoId(eventOrganizer.ktp_photo_id);
    }
    if (eventOrganizer.npwp_photo_id) {
      setNpwpPhotoId(eventOrganizer.npwp_photo_id);
    }
  }, [eventOrganizer]);

  const handleKtpUpload = async (file: File) => {
    try {
      const response = await assetsService.uploadAsset(file);
      setKtpPhotoId(response.body.asset.id);
    } catch (error) {
      console.error('Failed to upload KTP image:', error);
    }
  };

  const handleNpwpUpload = async (file: File) => {
    try {
      const response = await assetsService.uploadAsset(file);
      setNpwpPhotoId(response.body.asset.id);
    } catch (error) {
      console.error('Failed to upload NPWP image:', error);
    }
  };

  const handleKtpRemove = () => {
    setKtpPhotoId('');
  };

  const handleNpwpRemove = () => {
    setNpwpPhotoId('');
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      const payload: any = {
        npwp_photo_id: npwpPhotoId,
        npwp_number: data.npwp_number,
        npwp_address: data.npwp_address,
        full_name: data.full_name
      };

      if (isIndividual) {
        payload.ktp_photo_id = ktpPhotoId;
        payload.ktp_number = data.ktp_number;
        payload.ktp_address = data.ktp_address;
        payload.pic_name = data.pic_name;
        payload.pic_title = data.pic_title;
      }

      if (onSubmit) {
        onSubmit(payload);
      }
    } catch (error) {
      console.error('Failed to submit legal form:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <H4 fontWeight={600} marginBottom={2}>
          {isIndividual ? 'Individual' : 'Company'}
        </H4>
        <Divider sx={{ borderColor: 'text.secondary', marginBottom: 3 }} />

        {/* Document Upload Section */}
        <Grid container spacing={3} mb={3}>
          {isIndividual && (
            <Grid item md={6} xs={12}>
              <Body2 color="text.primary" mb={1}>
                Upload KTP*
              </Body2>
              <Dropzone
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                height="200px"
                maxSize={2 * 1024 * 1024} // 2MB
                width="100%"
                existingFileUrl={eventOrganizer.ktpPhoto?.url}
                onFileSelect={handleKtpUpload}
                onFileRemove={handleKtpRemove}
              />
            </Grid>
          )}

          <Grid item md={6} xs={12}>
            <Body2 color="text.primary" mb={1}>
              Upload NPWP*
            </Body2>
            <Dropzone
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
              height="200px"
              maxSize={2 * 1024 * 1024} // 2MB
              width="100%"
              existingFileUrl={eventOrganizer.npwpPhoto?.url}
              onFileSelect={handleNpwpUpload}
              onFileRemove={handleNpwpRemove}
            />
          </Grid>
        </Grid>

        {/* Form Fields Section */}
        <Grid container spacing={3}>
          {/* Left Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isIndividual ? 'NPWP Number*' : 'Company NPWP Number*'}
                  name="npwp_number"
                  placeholder={
                    isIndividual
                      ? '00.000.000.0-000.000'
                      : '00.000.000.0-000.000'
                  }
                  rules={{
                    required: 'NPWP number is required'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address as in NPWP*"
                  name="npwp_address"
                  placeholder="Address as in NPWP"
                  rules={{
                    required: 'NPWP address is required'
                  }}
                />
              </Grid>
              {isIndividual && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="KTP Number*"
                      name="ktp_number"
                      placeholder="5651782373637846"
                      rules={{
                        required: 'KTP number is required'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="KTP Address*"
                      name="ktp_address"
                      placeholder="KTP Address"
                      rules={{
                        required: 'KTP address is required'
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          {/* Right Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name as in NPWP*"
                  name="full_name"
                  placeholder="Full Name as in NPWP"
                  rules={{
                    required: 'Full name is required'
                  }}
                />
              </Grid>
              {isIndividual && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PIC Full Name*"
                      name="pic_name"
                      placeholder="PIC Full Name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PIC Title*"
                      name="pic_title"
                      placeholder="PIC Title"
                    />
                  </Grid>
                </>
              )}
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
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Legal Document'}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};
