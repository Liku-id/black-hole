import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';

interface LegalFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
}

const LegalForm = ({ eventOrganizer, loading, error }: LegalFormProps) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2>Loading legal information...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2 color="error.main">Failed to load legal information: {error}</Body2>
      </Box>
    );
  }

  if (!eventOrganizer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Body2>No legal information found</Body2>
      </Box>
    );
  }

  return (
    <Box>
      <Body2>Legal Information for: {eventOrganizer.name}</Body2>
      <Box mt={2}>
        <Body2>NIK: {eventOrganizer.nik || 'Not provided'}</Body2>
        <Body2>NPWP: {eventOrganizer.npwp || 'Not provided'}</Body2>
        <Body2>Organizer Type: {eventOrganizer.organizer_type || 'Not specified'}</Body2>
        <Body2>Full Name: {eventOrganizer.full_name || 'Not provided'}</Body2>
        <Body2>PIC Name: {eventOrganizer.pic_name || 'Not provided'}</Body2>
        <Body2>PIC Title: {eventOrganizer.pic_title || 'Not provided'}</Body2>
      </Box>
      {eventOrganizer.ktpPhoto && (
        <Box mt={2}>
          <Body2>KTP Photo: Available</Body2>
        </Box>
      )}
      {eventOrganizer.npwpPhoto && (
        <Box mt={2}>
          <Body2>NPWP Photo: Available</Body2>
        </Box>
      )}
      <Body2 mt={2}>Legal Form Component (Coming Soon)</Body2>
    </Box>
  );
};

export default LegalForm;
