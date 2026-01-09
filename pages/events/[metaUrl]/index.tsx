import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import {
  Button,
  Card,
  Caption,
  H2,
  H3,
  Overline,
  Tabs,
  Body2
} from '@/components/common';
import { ApprovalModal } from '@/components/features/approval/events/modal/approval';
import { EventDetailAssets } from '@/components/features/events/detail/assets';
import { EventDetailInfo } from '@/components/features/events/detail/info';
import { EventDetailTicket } from '@/components/features/events/detail/ticket';
import { StatusBadge } from '@/components/features/events/status-badge';
import { useToast } from '@/contexts/ToastContext';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { eventsService } from '@/services';

function EventDetail() {
  const router = useRouter();
  const { metaUrl, tab } = router.query;
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('detail');
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const { showSuccess } = useToast();

  // Set active tab from query params on mount and when query changes
  useEffect(() => {
    if (router.isReady && tab) {
      const validTabs = ['detail', 'assets', 'tickets'];
      if (validTabs.includes(tab as string)) {
        setActiveTab(tab as string);
      }
    }
  }, [router.isReady, tab]);

  const { eventDetail, loading, error, mutate } = useEventDetail(
    metaUrl as string
  );

  // Calculate tab statuses
  const getTabStatus = () => {
    if (!eventDetail)
      return { detail: undefined, assets: undefined, tickets: undefined };

    // Event Detail Status
    // If event status is rejected, eventUpdateRequest is always empty, so use eventDetailStatus directly
    // If event status is on_going or approved, check from eventUpdateRequest (if any) status
    //   - If status is rejected → show rejected icon
    //   - If status is pending → show pending icon
    //   - If status is approved: check if any updated fields exist, if yes show approved icon, if no don't show icon
    //   - If eventUpdateRequest empty → don't show tab status icon
    let detailStatus: 'rejected' | 'approved' | 'pending' | undefined;

    if (eventDetail.eventStatus === 'rejected') {
      // For rejected events, eventUpdateRequest is always empty, use eventDetailStatus directly
      if (eventDetail.eventDetailStatus === 'rejected') {
        detailStatus = 'rejected';
      } else if (eventDetail.eventDetailStatus === 'approved') {
        detailStatus = 'approved';
      } else if (eventDetail.eventDetailStatus === 'pending') {
        detailStatus = 'pending';
      }
    } else if (
      eventDetail.eventStatus === 'on_going' ||
      eventDetail.eventStatus === 'approved'
    ) {
      // For on_going or approved events, check eventUpdateRequest
      if (eventDetail.eventUpdateRequest) {
        const updateRequest = eventDetail.eventUpdateRequest;
        // Use eventDetailStatus for event detail tab, not the main status
        const eventDetailStatus = updateRequest.eventDetailStatus;

        if (eventDetailStatus === 'rejected') {
          detailStatus = 'rejected';
        } else if (
          eventDetailStatus === 'pending' ||
          eventDetailStatus === 'draft'
        ) {
          detailStatus = 'pending';
        } else if (eventDetailStatus === 'approved') {
          // Check if any fields have been updated
          const hasUpdatedFields = (() => {
            // Check name
            if (eventDetail.name !== updateRequest.name) return true;

            // Check eventType
            if (eventDetail.eventType !== updateRequest.eventType) return true;

            // Check description
            if (eventDetail.description !== updateRequest.description)
              return true;

            // Check address
            if (eventDetail.address !== updateRequest.address) return true;

            // Check mapLocationUrl
            if (eventDetail.mapLocationUrl !== updateRequest.mapLocationUrl)
              return true;

            // Check termAndConditions
            if (
              eventDetail.termAndConditions !== updateRequest.termAndConditions
            )
              return true;

            // Check websiteUrl
            if (eventDetail.websiteUrl !== updateRequest.websiteUrl)
              return true;

            // Check startDate/endDate
            if (
              eventDetail.startDate !== updateRequest.startDate ||
              eventDetail.endDate !== updateRequest.endDate
            ) {
              return true;
            }

            // Check cityId
            if (eventDetail.city?.id !== updateRequest.cityId) return true;

            // Check paymentMethodIds
            const eventPaymentMethodIds = (eventDetail.paymentMethods ?? [])
              .map((pm) => pm.id)
              .filter(Boolean)
              .slice()
              .sort();
            const updatePaymentMethodIds = (
              updateRequest.paymentMethodIds ?? []
            )
              .slice()
              .sort();
            if (
              JSON.stringify(eventPaymentMethodIds) !==
              JSON.stringify(updatePaymentMethodIds)
            ) {
              return true;
            }

            // Check adminFee
            if (eventDetail.adminFee !== updateRequest.adminFee) return true;

            // Check tax
            if (eventDetail.tax !== updateRequest.tax) return true;

            // Check login_required
            const eventLoginRequired = eventDetail.login_required ? 1 : 2;
            const updateLoginRequired =
              (updateRequest as any).login_required !== undefined
                ? (updateRequest as any).login_required
                  ? 1
                  : 2
                : eventLoginRequired;
            if (eventLoginRequired !== updateLoginRequired) return true;

            return false;
          })();

          // Only show approved icon if there are updated fields
          if (hasUpdatedFields) {
            detailStatus = 'approved';
          }
          // If no updated fields, detailStatus remains undefined (no tab status icon)
        }
      }
      // If no eventUpdateRequest, detailStatus remains undefined (no tab status icon)
    }

    // Event Asset Status - Priority: rejected > pending > approved
    let assetStatus: 'rejected' | 'approved' | 'pending' | undefined;

    // For rejected events, always use eventAssets (not eventAssetChanges)
    if (eventDetail.eventStatus === 'rejected') {
      assetStatus = eventDetail.eventAssetChanges[0]?.status as
        | 'rejected'
        | 'approved'
        | 'pending'
        | undefined;
    } else if (
      eventDetail.eventStatus === 'on_review' ||
      eventDetail.eventStatus === 'on_going'
    ) {
      // For on_review / on_going events, read status from firstChange.status if eventAssetChanges exists
      const assetChanges = eventDetail.eventAssetChanges || [];

      if (assetChanges.length > 0) {
        // Read status directly from firstChange.status
        const firstChangeStatus = assetChanges[0]?.status;
        if (firstChangeStatus === 'rejected') {
          assetStatus = 'rejected';
        } else if (firstChangeStatus === 'pending' || !firstChangeStatus) {
          assetStatus = 'pending';
        } else if (firstChangeStatus === 'approved') {
          assetStatus = 'approved';
        }
      } else {
        // For on_going events, if eventAssetChanges is empty, don't show tab status
        if (eventDetail.eventStatus === 'on_going') {
          assetStatus = undefined;
        } else {
          // For on_review events, fall back to eventAssets statuses
          const assetsToCheck = eventDetail.eventAssets || [];

          const hasRejectedAsset = assetsToCheck.some(
            (ea: any) => ea.status === 'rejected'
          );
          const hasPendingAsset = assetsToCheck.some(
            (ea: any) => !ea.status || ea.status === 'pending'
          );
          const allAssetsApproved =
            assetsToCheck.length > 0 &&
            assetsToCheck.every((ea: any) => ea.status === 'approved');

          if (hasRejectedAsset) {
            assetStatus = 'rejected';
          } else if (hasPendingAsset) {
            assetStatus = 'pending';
          } else if (allAssetsApproved) {
            assetStatus = 'approved';
          }
        }
      }
    } else if (eventDetail.eventStatus === 'approved') {
      // For approved events, only show status if eventAssetChanges exists
      const assetChanges = eventDetail.eventAssetChanges || [];

      if (assetChanges.length > 0) {
        // Read status directly from firstChange.status
        const firstChangeStatus = assetChanges[0]?.status;
        if (firstChangeStatus === 'rejected') {
          assetStatus = 'rejected';
        } else if (firstChangeStatus === 'pending' || !firstChangeStatus) {
          assetStatus = 'pending';
        } else if (firstChangeStatus === 'approved') {
          assetStatus = 'approved';
        }
      } else {
        // If eventAssetChanges is empty, don't show tab status
        assetStatus = undefined;
      }
    } else {
      // For other statuses, fall back to eventAssets status fields
      const assetsToCheck = eventDetail.eventAssets || [];

      const hasRejectedAsset = assetsToCheck.some(
        (ea: any) => ea.status === 'rejected'
      );
      const hasPendingAsset = assetsToCheck.some(
        (ea: any) => !ea.status || ea.status === 'pending'
      );
      const allAssetsApproved =
        assetsToCheck.length > 0 &&
        assetsToCheck.every((ea: any) => ea.status === 'approved');

      if (hasRejectedAsset) {
        assetStatus = 'rejected';
      } else if (hasPendingAsset) {
        assetStatus = 'pending';
      } else if (allAssetsApproved) {
        assetStatus = 'approved';
      }
    }

    // Ticket Status - Priority: pending > rejected > approved
    // Don't show approved status when event status is ongoing
    let ticketStatus: 'rejected' | 'approved' | 'pending' | undefined;
    const hasPendingTicket = eventDetail.ticketTypes?.some(
      (tt: any) => !tt.status || tt.status === 'pending'
    );
    const hasRejectedTicket = eventDetail.ticketTypes?.some(
      (tt: any) => tt.status === 'rejected'
    );
    const allApproved =
      eventDetail.ticketTypes?.length > 0 &&
      eventDetail.ticketTypes?.every((tt: any) => tt.status === 'approved');

    // For on_going or approved events, only show status if there are pending tickets
    if (
      eventDetail.eventStatus === 'on_going' ||
      eventDetail.eventStatus === 'approved'
    ) {
      if (hasPendingTicket) {
        ticketStatus = 'pending';
      } else {
        // Don't show tab status if no pending tickets
        ticketStatus = undefined;
      }
    } else {
      // For other event statuses, use the original logic
      if (hasPendingTicket) {
        ticketStatus = 'pending';
      } else if (hasRejectedTicket) {
        ticketStatus = 'rejected';
      } else if (allApproved) {
        ticketStatus = 'approved';
      }
    }

    return {
      detail: detailStatus,
      assets: assetStatus,
      tickets: ticketStatus
    };
  };

  const tabStatuses = getTabStatus();

  // Show status indicators when event status is "rejected" or when eventUpdateRequest exists (for on_going events)
  const showStatusIndicators =
    eventDetail?.eventStatus !== 'draft' &&
    eventDetail?.eventStatus !== 'on_review' &&
    (eventDetail?.eventStatus === 'rejected' ||
      !!eventDetail?.eventUpdateRequest ||
      (!!eventDetail?.eventAssetChanges &&
        eventDetail.eventAssetChanges.length > 0));

  // Check if no section is rejected (EO has fixed all rejected sections)
  const canResubmitRejectedEvent = () => {
    if (eventDetail?.eventStatus !== 'rejected') return false;

    const statuses = [
      tabStatuses.detail,
      tabStatuses.assets,
      tabStatuses.tickets
    ];

    // No section should be rejected
    return statuses.every((status) => status !== 'rejected');
  };

  // Check if there's any pending status from eventDetailStatus, eventAssetChanges, or ticketTypes
  const hasAnyPendingStatus = () => {
    if (!eventDetail) return false;

    // Check eventUpdateRequest.eventDetailStatus
    const hasPendingEventDetailStatus =
      eventDetail.eventUpdateRequest?.eventDetailStatus === 'pending';

    // Check eventAssetChanges firstChange status
    const hasPendingAssetStatus =
      eventDetail.eventAssetChanges &&
      eventDetail.eventAssetChanges.length > 0 &&
      eventDetail.eventAssetChanges[0]?.status === 'pending';

    // Check if any ticket has pending status
    const hasPendingTicket = eventDetail.ticketTypes?.some(
      (tt: any) => tt.status === 'pending'
    );

    return (
      hasPendingEventDetailStatus || hasPendingAssetStatus || hasPendingTicket
    );
  };

  // Determine if submit/resubmit button should be enabled
  const isSubmitButtonEnabled = () => {
    if (!eventDetail) return false;
    if (eventDetail.eventStatus === 'draft') return true;
    if (eventDetail.eventStatus === 'rejected')
      return canResubmitRejectedEvent();

    // For approved or on_going events, enable if there are pending changes
    if (
      eventDetail.eventStatus === 'approved' ||
      eventDetail.eventStatus === 'on_going'
    ) {
      // Check if eventUpdateRequestStatus is draft or pending
      const hasPendingUpdateRequest =
        eventDetail.eventUpdateRequestStatus === 'draft' ||
        eventDetail.eventUpdateRequestStatus === 'pending';

      // Check if eventAssetChanges is not empty
      const hasAssetChanges =
        eventDetail.eventAssetChanges &&
        eventDetail.eventAssetChanges.length > 0;

      // Check if any ticket has pending status
      const hasPendingTicket = eventDetail.ticketTypes?.some(
        (tt: any) => tt.status === 'pending'
      );

      return hasPendingUpdateRequest || hasAssetChanges || hasPendingTicket;
    }

    return false;
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

      // Close modal
      setIsSubmitConfirmOpen(false);

      // Show success toast
      const message =
        eventDetail.eventStatus === 'rejected'
          ? 'Event resubmitted successfully!'
          : 'Event submitted successfully!';
      showSuccess(message);
    } catch (error) {
      console.error('Error submitting event:', error);
      const errorMsg =
        (error as any)?.response?.data?.message ||
        (error as Error)?.message ||
        'Failed to submit event';
      setErrorMessage(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (!eventDetail) return 'Submit Event';
    if (eventDetail.eventStatus === 'approved') return 'Submit Changes';
    if (eventDetail.eventStatus === 'on_going') return 'Submit Changes';
    if (eventDetail.eventStatus === 'rejected') return 'Resubmit Event';
    return 'Submit Event';
  };

  const getSubmitModalTitle = () => {
    if (!eventDetail) return 'Submit Event';
    if (eventDetail.eventStatus === 'approved') return 'Submit Changes';
    if (eventDetail.eventStatus === 'on_going') return 'Submit Changes';
    if (eventDetail.eventStatus === 'rejected') return 'Resubmit Event';
    return 'Submit Event';
  };

  const getSubmitModalMessage = () => {
    if (!eventDetail) return 'Are you sure you want to submit this event?';
    if (eventDetail.eventStatus === 'approved') {
      return `Are you sure you want to submit the changes for "${eventDetail.name}"?`;
    }
    if (eventDetail.eventStatus === 'on_going') {
      return `Are you sure you want to submit the changes for "${eventDetail.name}"?`;
    }
    if (eventDetail.eventStatus === 'rejected') {
      return `Are you sure you want to resubmit the event "${eventDetail.name}"?`;
    }
    return `Are you sure you want to submit the event "${eventDetail.name}"?`;
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
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        mb="21px"
      >
        <H2 color="text.primary" fontWeight={700}>
          Event Detail
        </H2>
        {eventDetail.eventStatus !== 'on_review' &&
          eventDetail.eventStatus !== 'done' && (
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {eventDetail.is_requested ? (
                <Box
                  border="1px solid"
                  borderColor="warning.main"
                  borderRadius={1}
                  p="12px 16px"
                  sx={{
                    backgroundColor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Body2 color="warning.dark" fontWeight={500}>
                    Event update request is on review
                  </Body2>
                </Box>
              ) : (
                <>
                  {/* For rejected events, always show Resubmit Event button */}
                  {/* For other events, show button if there's any pending status from eventDetailStatus, eventAssetChanges, or ticketTypes */}
                  {(eventDetail.eventStatus === 'rejected' ||
                    hasAnyPendingStatus()) && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => setIsSubmitConfirmOpen(true)}
                        disabled={
                          submitLoading ||
                          !isSubmitButtonEnabled() ||
                          eventDetail.eventUpdateRequestStatus === 'pending'
                        }
                      >
                        {getSubmitButtonText()}
                      </Button>
                      {errorMessage && (
                        <Overline color="error" sx={{ mt: 1 }}>
                          {errorMessage}
                        </Overline>
                      )}
                    </>
                  )}
                </>
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
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            router.push(
              {
                pathname: router.pathname,
                query: { ...router.query, tab: tabId }
              },
              undefined,
              { shallow: true }
            );
          }}
        />
      </Box>

      {/* Tab Content Card */}
      <Card sx={{ mb: 3 }}>
        {activeTab === 'detail' && (
          <EventDetailInfo
            eventDetail={eventDetail}
            showRejectionInfo={showStatusIndicators}
          />
        )}
        {activeTab === 'assets' && (
          <EventDetailAssets
            eventDetail={eventDetail}
            eventAssetChanges={eventDetail?.eventAssetChanges}
            showStatus={
              showStatusIndicators &&
              !(
                (eventDetail.eventStatus === 'on_going' ||
                  eventDetail.eventStatus === 'approved') &&
                (!eventDetail.eventAssetChanges ||
                  eventDetail.eventAssetChanges.length === 0)
              )
            }
          />
        )}
        {activeTab === 'tickets' && (
          <EventDetailTicket eventDetail={eventDetail} showStatus={true}           />
        )}
      </Card>

      {/* Submit Confirmation Modal */}
      <ApprovalModal
        error={errorMessage}
        eventName={eventDetail?.name}
        loading={submitLoading}
        message={getSubmitModalMessage()}
        open={isSubmitConfirmOpen}
        title={getSubmitModalTitle()}
        onClose={() => {
          setIsSubmitConfirmOpen(false);
          setErrorMessage(null);
        }}
        onConfirm={handleSubmitEvent}
      />
    </DashboardLayout>
  );
}

export default withAuth(EventDetail, { requireAuth: true });
