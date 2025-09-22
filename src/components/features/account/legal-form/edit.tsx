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
import { stringUtils } from '@/utils';

interface LegalEditFormProps {
  eventOrganizer: EventOrganizer;
  onSubmit?: (data: any) => void;
  error?: string | null;
  loading?: boolean;
}

interface FormData {
  npwp_number: string;
  ktp_number: string;
  ktp_address: string;
  pic_name: string;
}

export const LegalEditForm = ({
  eventOrganizer,
  onSubmit,
  error,
  loading
}: LegalEditFormProps) => {
  const [ktpPhotoId, setKtpPhotoId] = useState<string>('');
  const [npwpPhotoId, setNpwpPhotoId] = useState<string>('');

  const isIndividual = eventOrganizer.organizer_type === 'individual';

  const methods = useForm<FormData>({
    defaultValues: {
      npwp_number: stringUtils.formatNpwpNumber(eventOrganizer.npwp || ''),
      ktp_number: eventOrganizer.nik || '',
      ktp_address: eventOrganizer.ktp_address || '',
      pic_name: eventOrganizer.pic_name || ''
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
        npwp_number: stringUtils.cleanNpwpNumber(data.npwp_number),
        ktp_photo_id: ktpPhotoId,
        ktp_number: data.ktp_number,
        ktp_address: data.ktp_address,
        pic_name: data.pic_name
      };

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
                  label="NPWP Number*"
                  name="npwp_number"
                  placeholder="00.000.000.0-000.000"
                  formatValue={stringUtils.formatNpwpNumber}
                  rules={{
                    required: 'NPWP number is required'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="NIK Number*"
                  name="ktp_number"
                  placeholder="5651782373637846"
                  rules={{
                    required: 'NIK number is required'
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PIC Full Name*"
                  name="pic_name"
                  placeholder="PIC Full Name"
                  rules={{
                    required: 'PIC Full Name is required'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PIC KTP Address*"
                  name="ktp_address"
                  placeholder="PIC KTP Address"
                  rules={{
                    required: 'PIC KTP Address is required'
                  }}
                />
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
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Legal Document'}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};
