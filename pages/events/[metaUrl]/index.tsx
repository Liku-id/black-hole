import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Caption, H2, H3, Overline, Tabs } from '@/components/common';
import { eventsService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { EventDetailAssets } from '@/components/features/events/detail/assets';
import { EventDetailInfo } from '@/components/features/events/detail/info';
import { EventDetailTicket } from '@/components/features/events/detail/ticket';
import { StatusBadge } from '@/components/features/events/status-badge';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function EventDetail() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('detail');
  const { showSuccess } = useToast();

  const { eventDetail, loading, error, mutate } = useEventDetail(metaUrl as string);

  // Calculate tab statuses
  const getTabStatus = () => {
    if (!eventDetail) return { detail: undefined, assets: undefined, tickets: undefined };

    // Event Detail Status
    let detailStatus: 'rejected' | 'approved' | 'pending' | undefined;
    if (eventDetail.eventDetailStatus === 'rejected') {
      detailStatus = 'rejected';
    } else if (eventDetail.eventDetailStatus === 'approved') {
      detailStatus = 'approved';
    } else if (eventDetail.eventDetailStatus === 'pending') {
      detailStatus = 'pending';
    }

    // Event Asset Status - Priority: rejected > pending > approved
    let assetStatus: 'rejected' | 'approved' | 'pending' | undefined;
    const hasRejectedAsset = eventDetail.eventAssets?.some((ea: any) => 
      ea.status === 'rejected'
    );
    const hasPendingAsset = eventDetail.eventAssets?.some((ea: any) => 
      !ea.status || ea.status === 'pending'
    );
    const allAssetsApproved = eventDetail.eventAssets?.length > 0 && 
      eventDetail.eventAssets?.every((ea: any) => ea.status === 'approved');

    if (hasRejectedAsset) {
      assetStatus = 'rejected';
    } else if (hasPendingAsset) {
      assetStatus = 'pending';
    } else if (allAssetsApproved) {
      assetStatus = 'approved';
    }

    // Ticket Status - Priority: pending > rejected > approved
    let ticketStatus: 'rejected' | 'approved' | 'pending' | undefined;
    const hasPendingTicket = eventDetail.ticketTypes?.some((tt: any) => 
      !tt.status || tt.status === 'pending'
    );
    const hasRejectedTicket = eventDetail.ticketTypes?.some((tt: any) => 
      tt.status === 'rejected'
    );
    const allApproved = eventDetail.ticketTypes?.length > 0 && 
      eventDetail.ticketTypes?.every((tt: any) => tt.status === 'approved');

    if (hasPendingTicket) {
      ticketStatus = 'pending';
    } else if (hasRejectedTicket) {
      ticketStatus = 'rejected';
    } else if (allApproved) {
      ticketStatus = 'approved';
    }

    return {
      detail: detailStatus,
      assets: assetStatus,
      tickets: ticketStatus
    };
  };

  const tabStatuses = getTabStatus();
  
  // Only show status indicators when event status is "rejected"
  const showStatusIndicators = eventDetail?.eventStatus === 'rejected';

  // Check if no section is rejected (EO has fixed all rejected sections)
  const canResubmitRejectedEvent = () => {
    if (eventDetail?.eventStatus !== 'rejected') return false;
    
    const statuses = [
      tabStatuses.detail,
      tabStatuses.assets,
      tabStatuses.tickets
    ];
    
    // No section should be rejected
    return statuses.every(status => status !== 'rejected');
  };

  const handleSubmitEvent = async () => {
    if (!eventDetail) return;

    // Clear previous error message
    setErrorMessage(null);

    // Validasi for draft events
    if (eventDetail.eventStatus === 'draft') {
      if (!eventDetail.eventAssets || eventDetail.eventAssets.length === 0) {
        setErrorMessage('Event must have at least 1 asset');
        return;
      }

      if (!eventDetail.ticketTypes || eventDetail.ticketTypes.length === 0) {
        setErrorMessage('Event must have at least 1 ticket');
        return;
      }
    }
    
    // Validasi for rejected events
    if (eventDetail.eventStatus === 'rejected') {
      if (!canResubmitRejectedEvent()) {
        setErrorMessage('Please fix all rejected sections before resubmitting');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      await eventsService.submitEvent(eventDetail.id);

      // Mutate event detail untuk update data
      await mutate();

      // Show success toast
      const message = eventDetail.eventStatus === 'rejected' 
        ? 'Event resubmitted successfully!' 
        : 'Event submitted successfully!';
      showSuccess(message);
    } catch (error) {
      console.error('Error submitting event:', error);
      const errorMsg = (error as any)?.response?.data?.message || 
                      (error as Error)?.message || 
                      'Failed to submit event';
      setErrorMessage(errorMsg);
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
        {(eventDetail.eventStatus === 'draft' || canResubmitRejectedEvent()) && (
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Button
              variant="primary"
              onClick={handleSubmitEvent}
              disabled={submitLoading}
            >
              {eventDetail.eventStatus === 'rejected' ? 'Resubmit Event' : 'Submit Event'}
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

      {/* Tabs */}
      <Box mb={3}>
        <Tabs
          activeTab={activeTab}
          tabs={[
            { 
              id: 'detail', 
              title: 'Event Detail',
              status: showStatusIndicators ? tabStatuses.detail : undefined
            },
            { 
              id: 'assets', 
              title: 'Event Assets',
              status: showStatusIndicators ? tabStatuses.assets : undefined
            },
            { 
              id: 'tickets', 
              title: 'Event Tickets',
              status: showStatusIndicators ? tabStatuses.tickets : undefined
            }
          ]}
          onTabChange={setActiveTab}
        />
      </Box>

      {/* Tab Content Card */}
      <Card sx={{ mb: 3 }}>
        {activeTab === 'detail' && <EventDetailInfo eventDetail={eventDetail} showRejectionInfo={showStatusIndicators} />}
        {activeTab === 'assets' && <EventDetailAssets eventDetail={eventDetail} showStatus={showStatusIndicators} />}
        {activeTab === 'tickets' && <EventDetailTicket eventDetail={eventDetail} showStatus={true} />}
      </Card>

      {(eventDetail.eventStatus === 'draft' || canResubmitRejectedEvent()) && (
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Button
            variant="primary"
            onClick={handleSubmitEvent}
            disabled={submitLoading}
          >
            {eventDetail.eventStatus === 'rejected' ? 'Resubmit Event' : 'Submit Event'}
          </Button>
          {errorMessage && (
            <Overline color="error" sx={{ mt: 1 }}>
              {errorMessage}
            </Overline>
          )}
        </Box>
      )}
    </DashboardLayout>
  );
}

export default withAuth(EventDetail, { requireAuth: true });
