import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';
import { LegelFormDetailInfo } from './detail';

interface LegalFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
}

const LegalForm = ({
  eventOrganizer,
  loading,
  mode,
  error
}: LegalFormProps) => {
  console.log(eventOrganizer, '<<eventOrganizer');

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2>Loading legal information...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2 color="error.main">
          Failed to load legal information: {error}
        </Body2>
      </Box>
    );
  }

  if (!eventOrganizer) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2>No legal information found</Body2>
      </Box>
    );
  }

  if (mode === 'view') {
    return <LegelFormDetailInfo organizerDetail={eventOrganizer} />;
  }

  return (
    <Box>
      <Body2 mt={2}>Legal Form Component (Coming Soon)</Body2>
    </Box>
  );
};

export default LegalForm;
