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
import { ConfirmationModal } from './confirmation-modal';

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
  pic_title: string;
  npwp_address: string;
  full_name: string;
}

export const LegalEditForm = ({
  eventOrganizer,
  onSubmit,
  error,
  loading
}: LegalEditFormProps) => {
  const [ktpPhotoId, setKtpPhotoId] = useState<string>('');
  const [npwpPhotoId, setNpwpPhotoId] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isIndividual = eventOrganizer.organizer_type === 'individual';

  const methods = useForm<FormData>({
    defaultValues: {
      npwp_number: stringUtils.formatNpwpNumber(eventOrganizer.npwp || ''),
      ktp_number: eventOrganizer.nik || '',
      ktp_address: eventOrganizer.ktp_address || '',
      pic_name: eventOrganizer.pic_name || '',
      pic_title: eventOrganizer.pic_title || '',
      npwp_address: eventOrganizer.npwp_address || '',
      full_name: eventOrganizer.full_name || ''
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

  const handleKtpUpload = (file: File) => {
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setUploadError('File size must be less than 1MB');
      return;
    }

    setKtpFile(file);
    setUploadError(null);
  };

  const handleNpwpUpload = (file: File) => {
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setUploadError('File size must be less than 1MB');
      return;
    }

    setNpwpFile(file);
    setUploadError(null);
  };

  const handleKtpRemove = () => {
    setKtpFile(null);
    setKtpPhotoId('');
  };

  const handleNpwpRemove = () => {
    setNpwpFile(null);
    setNpwpPhotoId('');
  };

  const handleFormSubmit = async (data: FormData) => {
    setUploadError(null);

    // Early validation for individual organizer
    if (isIndividual) {
      // Required fields for individual
      if (!data.npwp_number.trim()) {
        setUploadError('NPWP number is required');
        return;
      }
      if (!data.ktp_number.trim()) {
        setUploadError('NIK number is required');
        return;
      }
      if (!data.ktp_address.trim()) {
        setUploadError('KTP address is required');
        return;
      }
      if (!data.pic_name.trim()) {
        setUploadError('PIC name is required');
        return;
      }
      // PIC title is optional for individual
      if (!npwpPhotoId && !npwpFile) {
        setUploadError('NPWP photo is required');
        return;
      }
      if (!ktpPhotoId && !ktpFile) {
        setUploadError('KTP photo is required');
        return;
      }
    } else {
      // Required fields for institutional
      if (!data.npwp_number.trim()) {
        setUploadError('Company NPWP number is required');
        return;
      }
      if (!data.npwp_address.trim()) {
        setUploadError('Address as in NPWP is required');
        return;
      }
      if (!data.full_name.trim()) {
        setUploadError('Full name as in NPWP is required');
        return;
      }
      if (!npwpPhotoId && !npwpFile) {
        setUploadError('NPWP photo is required');
        return;
      }
    }

    // Store form data and show confirmation modal
    setFormData(data);
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formData) return;

    setUploadError(null);
    setIsProcessing(true); // Start loading immediately

    try {
      let finalKtpPhotoId = ktpPhotoId;
      let finalNpwpPhotoId = npwpPhotoId;

      // Upload KTP file if new file is selected
      if (ktpFile) {
        try {
          const ktpResponse = await assetsService.uploadAsset(ktpFile);
          finalKtpPhotoId = ktpResponse.body.asset.id;
        } catch (error) {
          setUploadError('Failed to upload KTP image. Please try again.');
          setShowConfirmationModal(false);
          setIsProcessing(false);
          return;
        }
      }

      // Upload NPWP file if new file is selected
      if (npwpFile) {
        try {
          const npwpResponse = await assetsService.uploadAsset(npwpFile);
          finalNpwpPhotoId = npwpResponse.body.asset.id;
        } catch (error) {
          setUploadError('Failed to upload NPWP image. Please try again.');
          setShowConfirmationModal(false);
          setIsProcessing(false);
          return;
        }
      }

      // Create payload based on organizer type
      let payload: any = {
        npwp_photo_id: finalNpwpPhotoId,
        npwp_number: formData.npwp_number // Send formatted NPWP number (99.999.999.9-999.999)
      };

      if (isIndividual) {
        // Individual Creator - only send required fields
        payload = {
          npwp_photo_id: finalNpwpPhotoId,
          npwp_number: formData.npwp_number,
          ktp_photo_id: finalKtpPhotoId,
          ktp_number: formData.ktp_number,
          ktp_address: formData.ktp_address,
          pic_name: formData.pic_name
        };

        // Only include pic_title if it has a value
        if (formData.pic_title && formData.pic_title.trim()) {
          payload.pic_title = formData.pic_title;
        }
      } else {
        // Institutional Creator - only send required fields
        payload = {
          npwp_photo_id: finalNpwpPhotoId,
          npwp_number: formData.npwp_number,
          npwp_address: formData.npwp_address,
          full_name: formData.full_name
        };
      }

      if (onSubmit) {
        await onSubmit(payload);
      }

      setShowConfirmationModal(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to submit legal form:', error);
      setUploadError('Failed to submit form. Please try again.');
      setShowConfirmationModal(false);
      setIsProcessing(false);
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
                maxSize={1024 * 1024} // 1MB
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

        {/* Upload Error Display */}
        {uploadError && (
          <Box marginBottom={2}>
            <Overline color="error.main">{uploadError}</Overline>
          </Box>
        )}

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

              {isIndividual ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="NIK Number*"
                    name="ktp_number"
                    placeholder="5651782373637846"
                    InputProps={{
                      inputProps: {
                        maxLength: 16,
                        pattern: '[0-9]*',
                        inputMode: 'numeric'
                      }
                    }}
                    rules={{
                      required: 'NIK number is required',
                      pattern: {
                        value: /^\d{16}$/,
                        message: 'NIK must be exactly 16 digits'
                      },
                      minLength: {
                        value: 16,
                        message: 'NIK must be exactly 16 digits'
                      },
                      maxLength: {
                        value: 16,
                        message: 'NIK must be exactly 16 digits'
                      }
                    }}
                  />
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address as in NPWP*"
                    name="npwp_address"
                    placeholder="Address as in NPWP"
                    rules={{
                      required: 'Address as in NPWP is required'
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Right Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              {isIndividual ? (
                <>
                  {/* Individual Creator Fields */}
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PIC Title"
                      name="pic_title"
                      placeholder="PIC Title (Optional)"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  {/* Institutional Creator Fields */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name as in NPWP*"
                      name="full_name"
                      placeholder="Full Name as in NPWP"
                      rules={{
                        required: 'Full Name as in NPWP is required'
                      }}
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
            <Button
              type="submit"
              variant="primary"
              disabled={
                loading ||
                (!npwpPhotoId && !npwpFile) ||
                (isIndividual && !ktpPhotoId && !ktpFile)
              }
            >
              {loading ? 'Updating...' : 'Save Legal Document'}
            </Button>
          </Box>
        </Box>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm!"
        declaration="I hereby declare that all information provided in the attached documents is true and accurate. Should any error, fraud, or falsification be discovered and/or proven, PT. Aku Rela Kamu Bahagia shall be released from any liability or consequences arising from the use of such data or documents."
        confirmButtonText="Confirm and Save"
        loading={isProcessing || loading}
      />
    </FormProvider>
  );
};
