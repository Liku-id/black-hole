import { useState } from 'react';

import { Box } from '@mui/material';

import { Body2 } from '@/components/common';

import { EventOrganizer } from '@/types/organizer';

import { useUpdateEventOrganizerLegal } from '@/hooks/features/organizers/useUpdateEventOrganizerLegal';

import { LegalFormDetailInfo } from './detail';
import { LegalEditForm } from './edit';

interface LegalFormProps {
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
  onRefresh?: () => void;
}

const LegalForm = ({
  eventOrganizer,
  loading,
  mode,
  error,
  onRefresh
}: LegalFormProps) => {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const {
    mutate: updateLegal,
    isPending: updateLoading,
    error: updateErrorState
  } = useUpdateEventOrganizerLegal();

  const handleSubmit = async (data: any) => {
    try {
      if (eventOrganizer?.id) {
        await updateLegal({
          eoId: eventOrganizer.id,
          payload: data
        });
        setUpdateError(null);
        onRefresh && onRefresh();
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
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="200px"
      >
        <Body2>Loading legal information...</Body2>
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
          Failed to load legal information: {error}
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
        error={updateError || updateErrorState}
        loading={updateLoading}
        onSubmit={handleSubmit}
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
