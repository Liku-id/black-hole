import { Box } from '@mui/material';
import Image from 'next/image';
import { FC, useEffect } from 'react';
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

interface Partner {
  id: string;
  partnerName: string;
  socialMediaLink:
    | string
    | { tiktok?: string; instagram?: string; twitter?: string };
  picName: string;
  picPhoneNumber: string;
}

interface EditPartnerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PartnerFormData) => void;
  partner?: Partner | null;
  loading?: boolean;
}

// Helper function to parse social media link
const parseSocialMediaLink = (
  link: string | { tiktok?: string; instagram?: string; twitter?: string }
): {
  tiktok: string;
  instagram: string;
  twitter: string;
} => {
  if (!link) return { tiktok: '', instagram: '', twitter: '' };

  // If it's already an object, return it with empty strings for missing values
  if (typeof link === 'object') {
    return {
      tiktok: link.tiktok || '',
      instagram: link.instagram || '',
      twitter: link.twitter || ''
    };
  }

  // If it's a string, try to parse as JSON
  if (typeof link === 'string') {
    try {
      const parsed = JSON.parse(link);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          tiktok: parsed.tiktok || '',
          instagram: parsed.instagram || '',
          twitter: parsed.twitter || ''
        };
      }
    } catch {
      // If parsing fails, treat as old format (single string)
      // Try to determine platform from URL
      const lowerLink = link.toLowerCase();

      // Check for TikTok
      if (lowerLink.includes('tiktok.com') || lowerLink.includes('tiktok')) {
        return { tiktok: link, instagram: '', twitter: '' };
      }

      // Check for Twitter/X
      if (
        lowerLink.includes('twitter.com') ||
        lowerLink.includes('x.com') ||
        lowerLink.startsWith('twitter:') ||
        lowerLink.startsWith('x:')
      ) {
        return { tiktok: '', instagram: '', twitter: link };
      }

      // Check for Instagram or handle @username format
      if (lowerLink.includes('instagram.com') || link.startsWith('@')) {
        return { tiktok: '', instagram: link, twitter: '' };
      }
    }
  }

  // Default to empty if we can't determine
  return { tiktok: '', instagram: '', twitter: '' };
};

export const EditPartnerModal: FC<EditPartnerModalProps> = ({
  open,
  onClose,
  onSubmit,
  partner,
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

  // Update form when partner data changes
  useEffect(() => {
    if (partner && open) {
      const socialMedia = parseSocialMediaLink(partner.socialMediaLink);

      methods.reset({
        partnerName: partner.partnerName || '',
        picName: partner.picName || '',
        picPhoneNumber: partner.picPhoneNumber || '',
        tiktokLink: socialMedia.tiktok,
        instagramLink: socialMedia.instagram,
        twitterLink: socialMedia.twitter
      });
    } else if (!partner && open) {
      methods.reset({
        partnerName: '',
        picName: '',
        picPhoneNumber: '',
        tiktokLink: '',
        instagramLink: '',
        twitterLink: ''
      });
    }
  }, [partner, open, methods]);

  const { watch } = methods;
  const tiktokLink = watch('tiktokLink');
  const instagramLink = watch('instagramLink');
  const twitterLink = watch('twitterLink');

  const hasAnySocialMedia = Boolean(tiktokLink || instagramLink || twitterLink);

  const handleSubmit = async (data: PartnerFormData) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Popup
      open={open}
      onClose={handleClose}
      title="Edit Partner Details"
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
              key={partner?.id || 'new-partner'}
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
                  fullWidth
                  id="tiktok_url_field"
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

            {/* Back and Save Buttons */}
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button
                id="back_button"
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                sx={{ minWidth: '120px' }}
              >
                Back
              </Button>
              <Button
                id="save_button"
                type="submit"
                variant="primary"
                disabled={loading}
                sx={{ minWidth: '120px' }}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Popup>
  );
};
