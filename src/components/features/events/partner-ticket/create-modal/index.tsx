import { Box } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button, Popup, PhoneField, TextField } from '@/components/common';
import { validationUtils } from '@/utils';

interface PartnerFormData {
  partnerName: string;
  picName: string;
  picPhoneNumber: string;
  tiktokLink: string;
  instagramLink: string;
  twitterLink: string;
}

interface CreatePartnerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PartnerFormData) => void;
  loading?: boolean;
}

export const CreatePartnerModal: FC<CreatePartnerModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false
}) => {
  const methods = useForm<PartnerFormData>({
    defaultValues: {
      partnerName: '',
      picName: '',
      picPhoneNumber: '',
      tiktokLink: '',
      instagramLink: '',
      twitterLink: ''
    }
  });

  const { watch } = methods;
  const tiktokLink = watch('tiktokLink');
  const instagramLink = watch('instagramLink');
  const twitterLink = watch('twitterLink');

  const hasAnySocialMedia = Boolean(tiktokLink || instagramLink || twitterLink);

  const handleSubmit = async (data: PartnerFormData) => {
    await onSubmit(data);
    methods.reset();
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Popup
      open={open}
      onClose={handleClose}
      title="Create Partner"
      width={443}
      height={682}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Partner Name */}
            <TextField
              id="partner_name_field"
              fullWidth
              label="Partner Name*"
              name="partnerName"
              placeholder="Partner Name"
              rules={{
                required: 'Partner name is required'
              }}
            />

            {/* PIC Name */}
            <TextField
              id="pic_name_field"
              fullWidth
              label="PIC Name*"
              name="picName"
              placeholder="PIC Name"
              rules={{
                required: 'PIC name is required'
              }}
            />

            {/* PIC Phone Number */}
            <PhoneField
              id="phone_number_field"
              fullWidth
              label="PIC Phone Number*"
              name="picPhoneNumber"
              placeholder="Phone Number"
              rules={{
                required: 'PIC phone number is required',
                validate: validationUtils.phoneNumberValidator
              }}
              defaultCountryCode="+62"
            />

            {/* Social Media Section */}
            <Box>
              <Box mb={1.5}>
                <TextField
                  fullWidth
                  label="Social media*"
                  name="socialMediaLabel"
                  value=""
                  disabled
                  sx={{ display: 'none' }}
                />
              </Box>

              {/* TikTok */}
              <Box mb={2}>
                <TextField
                  id="tiktok_url_field"
                  fullWidth
                  name="tiktokLink"
                  placeholder="Link Profile Account"
                  startComponent={
                    <Image
                      alt="TikTok"
                      height={20}
                      src="/icon/tiktok.svg"
                      width={20}
                    />
                  }
                  rules={{
                    validate: () => {
                      return (
                        hasAnySocialMedia ||
                        'At least one social media link is required'
                      );
                    }
                  }}
                />
              </Box>

              {/* Instagram */}
              <Box mb={2}>
                <TextField
                  fullWidth
                  id="instagram_url_field"
                  name="instagramLink"
                  placeholder="Link Profile Account"
                  startComponent={
                    <Image
                      alt="Instagram"
                      height={20}
                      src="/icon/instagram.svg"
                      width={20}
                    />
                  }
                  rules={{
                    validate: () => {
                      return (
                        hasAnySocialMedia ||
                        'At least one social media link is required'
                      );
                    }
                  }}
                />
              </Box>

              {/* X (Twitter) */}
              <Box mb={2}>
                <TextField
                  fullWidth
                  id="x_url_field"
                  name="twitterLink"
                  placeholder="Link Profile Account"
                  startComponent={
                    <Image
                      alt="X"
                      height={20}
                      src="/icon/twitter.svg"
                      width={20}
                    />
                  }
                  rules={{
                    validate: () => {
                      return (
                        hasAnySocialMedia ||
                        'At least one social media link is required'
                      );
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Continue Button */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                id="continue_button"
                type="submit"
                variant="primary"
                disabled={loading}
                sx={{ width: '100%', mx: 5 }}
              >
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Popup>
  );
};
