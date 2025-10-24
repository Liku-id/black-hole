import { Box, Divider, styled } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Caption, H2, H3, Overline } from '@/components/common';
import { eventsService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { EventDetailAssets } from '@/components/features/events/detail/assets';
import { EventDetailInfo } from '@/components/features/events/detail/info';
import { EventDetailTicket } from '@/components/features/events/detail/ticket';
import { StatusBadge } from '@/components/features/events/status-badge';
import { SuccessUpdateModal } from '@/components/features/events/edit/info/success-update-modal';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

const StyledDivider = styled(Divider)({
  margin: '24px 0px',
  borderColor: 'grey.100',
  borderWidth: '1px'
});

// Using shared StatusBadge component

function EventDetail() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showSuccess } = useToast();

  const { eventDetail, loading, error, mutate } = useEventDetail(metaUrl as string);

  // Check for updateSuccess parameter and show modal
  useEffect(() => {
    if (router.query.updateSuccess === 'true') {
      setShowSuccessModal(true);
      // Remove the parameter from URL without triggering a page reload
      const newUrl = router.asPath.split('?')[0];
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [router.query.updateSuccess, router]);

  const handleSubmitEvent = async () => {
    if (!eventDetail) return;

    // Clear previous error message
    setErrorMessage(null);

    // Validasi
    if (eventDetail.eventStatus !== 'draft') {
      setErrorMessage('Event must be in draft status');
      return;
    }

    if (!eventDetail.eventAssets || eventDetail.eventAssets.length === 0) {
      setErrorMessage('Event must have at least 1 asset');
      return;
    }

    if (!eventDetail.ticketTypes || eventDetail.ticketTypes.length === 0) {
      setErrorMessage('Event must have at least 1 ticket');
      return;
    }

    try {
      setSubmitLoading(true);
      await eventsService.submitEvent(eventDetail.id);

      // Mutate event detail untuk update data
      await mutate();

      // Show success toast
      showSuccess('Event submitted successfully!');
    } catch (error) {
      console.error('Error submitting event:', error);
      setErrorMessage('Failed to submit event');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Event - Black Hole Dashboard</title>
        </Head>
        <Box>Loading...</Box>
      </DashboardLayout>
    );
  }

  if (error || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Failed to load event: {error}</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{eventDetail.name} - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/events`)}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Event List
        </Caption>
      </Box>

      {/* Title and Submit Button */}
      <Box alignItems="center" display="flex" justifyContent="space-between" mb="21px">
        <H2 color="text.primary" fontWeight={700}>
          Event Detail
        </H2>
        {eventDetail.eventStatus === 'draft' && (
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Button
              variant="primary"
              onClick={handleSubmitEvent}
              disabled={submitLoading}
            >
              Submit Event
            </Button>
            {errorMessage && (
              <Overline color="error" sx={{ mt: 1 }}>
                {errorMessage}
              </Overline>
            )}
          </Box>
        )}
      </Box>

      {/* Event Name */}
      <Box alignItems="center" display="flex" gap={2} mb="16px">
        <H3 color="text.primary" fontWeight={700}>
          Event Name: {eventDetail.name}
        </H3>
        <StatusBadge status={eventDetail.eventStatus} />
      </Box>

      {/* Main Card */}
      <Card sx={{ mb: 3 }}>
        <EventDetailInfo eventDetail={eventDetail} />
        <StyledDivider />
        <EventDetailAssets eventDetail={eventDetail} />
        <StyledDivider />
        <EventDetailTicket eventDetail={eventDetail} />
      </Card>

      {eventDetail.eventStatus === 'draft' && (
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Button
            variant="primary"
            onClick={handleSubmitEvent}
            disabled={submitLoading}
          >
            Submit Event
          </Button>
          {errorMessage && (
            <Overline color="error" sx={{ mt: 1 }}>
              {errorMessage}
            </Overline>
          )}
        </Box>
      )}

      {/* Success Update Modal */}
      <SuccessUpdateModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        eventStatus={eventDetail?.eventStatus || ''}
      />
    </DashboardLayout>
  );
}

export default withAuth(EventDetail, { requireAuth: true });
