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

export const BankFormDetailInfo = ({
  organizerDetail
}: OrganizerDetailProps) => {
  return (
    <>
      <H4 fontWeight={600} marginBottom={2}>
        Bank Account Number
      </H4>

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
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
