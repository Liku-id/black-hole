import Image from 'next/image';
import { Box, Grid, Divider, Paper, Typography } from '@mui/material';

import { Body2, H4 } from '@/components/common';

interface OrganizerDetail {
  id: string;
  npwp_photo_id: string;
  npwp_number: string;
  npwp_address: string;
  ktp_photo_id: string;
  ktp_number: string;
  ktp_address: string;
  full_name: string;
  pic_name: string;
  pic_title: string;
  organizer_type?: string;
}

interface OrganizerDetailProps {
  organizerDetail: OrganizerDetail;
}

// DocumentImage component for displaying KTP/NPWP images
const DocumentImage = ({
  title,
  photoId,
  alt
}: {
  title: string;
  photoId: string;
  alt: string;
}) => (
  <Box>
    <Body2 color="text.primary" mb={1}>
      {title}
    </Body2>
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'grey.50'
      }}
    >
      {photoId ? (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            src={`/api/images/${photoId}`}
            alt={alt}
            fill
            style={{
              objectFit: 'contain',
              padding: '8px'
            }}
            onError={(e) => {
              // Handle image load error - show placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.insertAdjacentHTML(
                'beforeend',
                `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px;">
                  Image not available
                </div>`
              );
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100'
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            No {title.toLowerCase()} image available
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

// OrganizerField component
const OrganizerField = ({
  label,
  value
}: {
  label: string;
  value: string;
  isRejected?: boolean;
  icon?: React.ReactNode;
}) => (
  <Box>
    <Body2 color="text.primary" mb={1}>
      {label}
    </Body2>
    <Box
      border="1px solid"
      borderColor="primary.main"
      borderRadius={1}
      overflow="scroll"
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'primary.light',
        padding: '0px 16px',
        height: '46px'
      }}
    >
      <Body2 color="text.primary">{value || '-'}</Body2>
    </Box>
  </Box>
);

export const LegelFormDetailInfo = ({
  organizerDetail
}: OrganizerDetailProps) => {
  return (
    <>
      <H4 fontWeight={600} marginBottom={2}>
        {organizerDetail.organizer_type === 'individual'
          ? 'Individual'
          : 'Company'}
      </H4>
      <Divider sx={{ borderColor: 'text.secondary', marginBottom: 3 }} />

      {/* Document Images Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item md={6} xs={12}>
          <DocumentImage
            title="KTP Image"
            photoId={organizerDetail.ktp_photo_id}
            alt="KTP Document"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <DocumentImage
            title="NPWP Image"
            photoId={organizerDetail.npwp_photo_id}
            alt="NPWP Document"
          />
        </Grid>
      </Grid>

      {/* Form Fields Section */}
      <Grid container spacing={3}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="KTP Number*"
                value={organizerDetail.ktp_number}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="Address as in KTP"
                value={organizerDetail.ktp_address}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="Company NPWP Number*"
                value={organizerDetail.npwp_number}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="Address as in NPWP"
                value={organizerDetail.npwp_address}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="Full Name as in NPWP"
                value={organizerDetail.full_name}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="PIC Name"
                value={organizerDetail.pic_name}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="PIC Title"
                value={organizerDetail.pic_title}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
