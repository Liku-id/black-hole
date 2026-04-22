import InfoIcon from '@mui/icons-material/Info';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';

import { Body2 } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { eventsService } from '@/services/events';
import { UserRole } from '@/types/auth';

import { ActivateModal } from './modal';

interface OTSActivationSectionProps {
  selectedEventId: string;
  isPending: boolean;
  userRole: string;
}

export function OTSActivationSection({ selectedEventId, isPending, userRole }: OTSActivationSectionProps) {
  const { showInfo, showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleActivate = async () => {
    if (!selectedEventId) {
      showError('Please select an Event to activate OTS.');
      return;
    }
    try {
      setIsActivating(true);
      await eventsService.requestOTSActivation(selectedEventId);
      showInfo('OTS Request submitted successfully!');
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.includes('19329') || err?.response?.data?.statusCode === 19329) {
        showError('On-the-spot sales request already exists or is being processed for this event');
      } else {
        showError('Failed to submit OTS request.');
      }
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Stack alignItems="center" direction="row" gap="8px" mt="24px">
      <InfoIcon sx={{ color: 'text.secondary', fontSize: '24px' }} />
      {isPending ? (
        <Body2 color="text.primary" fontWeight={400}>
          On-the-spot sales request already exists or is being processed for this event
        </Body2>
      ) : userRole === UserRole.EVENT_ORGANIZER_PIC ? (
        <Body2 color="text.primary" fontWeight={400}>
          You need to Request to activated OTS (on the spot) ticket selling feature.{' '}
          <Box
            color="primary.main"
            component="span"
            fontWeight={400}
            onClick={handleOpenModal}
            sx={{ cursor: 'pointer' }}
          >
            Request activate feature
          </Box>
        </Body2>
      ) : (
        <Body2 color="text.primary" fontWeight={400}>
          On-the-spot sales is not activated for this event. Please contact your Event Organizer to activate it.
        </Body2>
      )}

      <ActivateModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onActivate={handleActivate}
        loading={isActivating}
      />
    </Stack>
  );
}
