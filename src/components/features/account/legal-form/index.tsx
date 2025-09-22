import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';
import { LegalFormDetailInfo } from './detail';
import { LegalEditForm } from './edit';
import { useUpdateEventOrganizerLegal } from '@/hooks';
import { useState } from 'react';

interface LegalFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
  onCancel?: () => void;
}

const LegalForm = ({
  eventOrganizer,
  loading,
  mode,
  error,
  onCancel
}: LegalFormProps) => {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const {
    updateLegal,
    loading: updateLoading,
    error: updateErrorState
  } = useUpdateEventOrganizerLegal();

  const handleSubmit = async (data: any) => {
    try {
      if (eventOrganizer?.id) {
        await updateLegal(eventOrganizer.id, data);
        setUpdateError(null);
        if (onCancel) {
          onCancel();
        }
      }
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : 'Failed to update legal information'
      );
    }
  };

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
    return <LegalFormDetailInfo organizerDetail={eventOrganizer} />;
  }

  if (mode === 'edit') {
    return (
      <LegalEditForm
        eventOrganizer={eventOrganizer}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        error={updateError || updateErrorState}
        loading={updateLoading}
      />
    );
  }

  return (
    <Box>
      <Body2 mt={2}>Legal Form Edit Component (Coming Soon)</Body2>
    </Box>
  );
};

export default LegalForm;
