import { Box } from '@mui/material';

import { Body2 } from '@/components/common';

import { EventOrganizer } from '@/types/organizer';

import { BankFormDetailInfo } from './detail';
import { BankEditForm } from './edit';
import { useUpdateEventOrganizerBank } from '@/hooks/features/organizers/useUpdateEventOrganizerBank';

interface BankFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
  onRefresh?: () => void;
}

const BankForm = ({
  eventOrganizer,
  loading,
  error,
  mode,
  onRefresh
}: BankFormProps) => {
  const {
    mutate: updateBank,
    isPending: updateLoading,
    error: updateError
  } = useUpdateEventOrganizerBank();

  const handleSubmit = async (data: any) => {
    if (!eventOrganizer?.id) return;

    try {
      await updateBank({
        eoId: eventOrganizer.id,
        payload: data
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to update bank information:', error);
    }
  };

  if (loading) {
    return (
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="200px"
      >
        <Body2>Loading bank information...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="200px"
      >
        <Body2 color="error.main">
          Failed to load bank information: {error}
        </Body2>
      </Box>
    );
  }

  if (!eventOrganizer) {
    return (
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="200px"
      >
        <Body2>No bank information found</Body2>
      </Box>
    );
  }

  if (mode === 'view') {
    return <BankFormDetailInfo organizerDetail={eventOrganizer} />;
  }

  if (mode === 'edit') {
    return (
      <BankEditForm
        eventOrganizer={eventOrganizer}
        error={updateError || null}
        loading={updateLoading}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <Box>
      <Body2>Bank Form Edit Component (Coming Soon)</Body2>
    </Box>
  );
};

export default BankForm;
