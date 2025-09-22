import { Box, Grid } from '@mui/material';

import { Body2 } from '@/components/common';
import { EventOrganizer } from '@/types/organizer';

interface BankFormDetailProps {
  organizerDetail: EventOrganizer;
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
}: BankFormDetailProps) => {
  return (
    <>
      {/* Form Fields Section */}
      <Grid container spacing={3}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="Bank Account Number"
                value={organizerDetail.bank_information?.accountNumber || '-'}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="Bank Account Holder Name"
                value={
                  organizerDetail.bank_information?.accountHolderName || '-'
                }
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="Bank Name"
                value={organizerDetail.bank_information?.bank?.name || '-'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
