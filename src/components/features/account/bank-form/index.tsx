import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';
import { BankFormDetailInfo } from './detail';

interface BankFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
    mode?: 'view' | 'edit';
}

const BankForm = ({ eventOrganizer, loading, error, mode }: BankFormProps) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2>Loading bank information...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2 color="error.main">Failed to load bank information: {error}</Body2>
      </Box>
    );
  }

  if (!eventOrganizer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2>No bank information found</Body2>
      </Box>
    );
  }

  if (mode === 'view') {
    return <BankFormDetailInfo organizerDetail={eventOrganizer} />;
  }

  return (
    <Box>
      <Body2>Bank Form Edit Component (Coming Soon)</Body2>
    </Box>
  );
};

export default BankForm;
