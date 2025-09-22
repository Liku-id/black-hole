import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';

interface BankFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
}

const BankForm = ({ eventOrganizer, loading, error }: BankFormProps) => {
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

  return (
    <Box>
      <Body2>Bank Information for: {eventOrganizer.name}</Body2>
      {eventOrganizer.bank_information && (
        <Box mt={2}>
          <Body2>Bank: {eventOrganizer.bank_information.bank.name}</Body2>
          <Body2>Account Number: {eventOrganizer.bank_information.accountNumber}</Body2>
          <Body2>Account Holder: {eventOrganizer.bank_information.accountHolderName}</Body2>
        </Box>
      )}
      <Body2 mt={2}>Bank Form Component (Coming Soon)</Body2>
    </Box>
  );
};

export default BankForm;
