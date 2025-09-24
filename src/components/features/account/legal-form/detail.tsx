import { Box, Grid, Divider, Typography } from '@mui/material';

import { Body1, Body2 } from '@/components/common';
import { EventOrganizer } from '@/types/organizer';

interface LegalFormDetailProps {
  organizerDetail: EventOrganizer;
}

// DocumentImage component for displaying KTP/NPWP images
const DocumentImage = ({
  title,
  asset,
  alt
}: {
  title: string;
  asset: any;
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
      {asset?.url ? (
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
          <img
            src={asset.url}
            alt={alt}
            style={{
              objectFit: 'contain',
              padding: '4px',
              width: '100%',
              height: '100%',
              display: 'block'
            }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              target.insertAdjacentHTML(
                'afterend',
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

export const LegalFormDetailInfo = ({
  organizerDetail
}: LegalFormDetailProps) => {
  const isIndividual = organizerDetail.organizer_type === 'individual';

  return (
    <>
      <Body1 fontWeight={600} marginBottom={2}>
        {isIndividual ? 'Individual Creator' : 'Company Creator'}
      </Body1>
      <Divider sx={{ borderColor: 'text.secondary', marginBottom: 3 }} />

      {/* Document Images Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item md={6} xs={12}>
          <DocumentImage
            title={isIndividual ? 'KTP Image*' : 'NPWP Image*'}
            asset={
              isIndividual
                ? organizerDetail.ktpPhoto
                : organizerDetail.npwpPhoto
            }
            alt={isIndividual ? 'KTP Document' : 'NPWP Document'}
          />
        </Grid>
        {isIndividual && (
          <Grid item md={6} xs={12}>
            <DocumentImage
              title="NPWP Image*"
              asset={organizerDetail.npwpPhoto}
              alt="NPWP Document"
            />
          </Grid>
        )}
      </Grid>

      {/* Form Fields Section */}
      <Grid container spacing={3}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            {isIndividual ? (
              <>
                {/* Individual Creator Fields */}
                <Grid item xs={12}>
                  <OrganizerField
                    label="NPWP Number*"
                    value={organizerDetail.npwp || '-'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <OrganizerField
                    label="NIK Number*"
                    value={organizerDetail.nik || '-'}
                  />
                </Grid>
              </>
            ) : (
              <>
                {/* Institutional Creator Fields */}
                <Grid item xs={12}>
                  <OrganizerField
                    label="Company NPWP Number*"
                    value={organizerDetail.npwp || '-'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <OrganizerField
                    label="Address as in NPWP*"
                    value={organizerDetail.npwp_address || '-'}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            {isIndividual ? (
              <>
                <Grid item xs={12}>
                  <OrganizerField
                    label="PIC Full Name*"
                    value={organizerDetail.pic_name || '-'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <OrganizerField
                    label="PIC KTP Address*"
                    value={organizerDetail.ktp_address || '-'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <OrganizerField
                    label="PIC Title"
                    value={organizerDetail.pic_title || '-'}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <OrganizerField
                    label="Full Name as in NPWP*"
                    value={organizerDetail.full_name || '-'}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
