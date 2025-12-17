import { Box, Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Body2, Button, H3 } from '@/components/common';
import { EventDetail } from '@/types/event';
import { dateUtils, apiUtils } from '@/utils';
import { ErrorOutline } from '@mui/icons-material';
import { PreviewEventModal } from './preview-modal';

interface EventDetailInfoProps {
  eventDetail: EventDetail;
  showRejectionInfo?: boolean;
}

// EventField component
const EventField = ({
  label,
  value,
  isTextArea = false,
  isRejected
}: {
  label: string;
  value: string;
  isTextArea?: boolean;
  isRejected?: boolean;
}) => (
  <Box>
    <Body2
      color="text.secondary"
      mb={1}
      display="flex"
      alignItems="center"
      gap={0.5}
    >
      {label} {isRejected && <ErrorOutline fontSize="small" color="error" />}
    </Body2>
    <Box
      border="1px solid"
      borderColor="primary.main"
      borderRadius={1}
      overflow="scroll"
      p="12px 16px"
      sx={{
        backgroundColor: 'primary.light',
        ...(isTextArea && { height: '216px' })
      }}
    >
      <Body2 color="text.primary">{value}</Body2>
    </Box>
  </Box>
);

export const RejectedReason = ({ reason }: { reason: string }) => {
  if (!reason || reason.trim() === '') return null;

  return (
    <Box mb={2}>
      <Box
        border="1px solid"
        borderColor="error.main"
        borderRadius={1}
        p="12px 16px"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'error.light',
          borderLeft: '4px solid',
          borderLeftColor: 'error.main'
        }}
      >
        <Body2 color="error.dark" fontWeight={500}>
          Rejection Reason:
        </Body2>
        <Body2 color="text.primary">{reason}</Body2>
      </Box>
    </Box>
  );
};

export const EventDetailInfo = ({ eventDetail, showRejectionInfo = false }: EventDetailInfoProps) => {
  const router = useRouter();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Check if we should show event update request rejection info
  const isEventApprovedOrOngoing = 
    eventDetail.eventStatus === 'approved' || eventDetail.eventStatus === 'on_going';
  const hasRejectedUpdateRequest = 
    eventDetail.eventUpdateRequest && 
    eventDetail.eventUpdateRequest.status === 'rejected';
  const showUpdateRequestRejection = isEventApprovedOrOngoing && hasRejectedUpdateRequest;

  // Determine which rejection info to show
  const rejectionReason = showUpdateRequestRejection 
    ? eventDetail.eventUpdateRequest?.rejectedReason 
    : eventDetail.rejectedReason;
  const rejectedFieldsArray = showUpdateRequestRejection 
    ? eventDetail.eventUpdateRequest?.rejectedFields 
    : eventDetail.rejectedFields;

  const isFieldRejected = (fieldName: string) => {
    // Check for update request rejection first
    if (showUpdateRequestRejection && rejectedFieldsArray) {
      return rejectedFieldsArray.includes(fieldName);
    }
    // Fallback to event rejection
    if (showRejectionInfo && eventDetail.rejectedFields) {
      return eventDetail.rejectedFields.includes(fieldName);
    }
    return false;
  };

  const handlePreviewConfirm = async () => {
    try {
      const response = await apiUtils.get<{
        accessToken: string;
        refreshToken: string;
      }>('/api/auth/tokens');
      
      // Encrypt token via API route (server-side encryption with key)
      const encryptResponse = await apiUtils.post<{
        encryptedToken: string;
      }>('/api/preview-token/encrypt', {
        token: response.accessToken
      });
      
      // Build URL dengan preview_token (encode untuk URL safety)
      const wukongUrl = process.env.NEXT_PUBLIC_WUKONG_URL || 'https://wukong.co.id';
      const previewUrl = `${wukongUrl}/event/${eventDetail.metaUrl}?preview_token=${encodeURIComponent(encryptResponse.encryptedToken)}`;
      
      // Redirect ke black-void dengan preview_token
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      
      setIsPreviewModalOpen(false);
    } catch (error) {
      console.error('Error fetching or encrypting token:', error);
      setIsPreviewModalOpen(false);
    }
  };

  return (
    <>
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        mb={2}
      >
        <H3 color="text.primary" fontWeight={700}>
          Event Detail
        </H3>
        {eventDetail.eventStatus !== 'done' &&
        eventDetail.eventStatus !== 'on_review' &&
        eventDetail.is_requested === false ? (
          <Box display="flex" gap={2}>
            {eventDetail.eventStatus === "draft" && (
              <Button
                variant="secondary"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                Preview Event
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => router.push(`/events/edit/${eventDetail.metaUrl}`)}
            >
              Edit Detail Event
            </Button>
          </Box>
        ) : (
          eventDetail.is_requested === true && (
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
          )
        )}
      </Box>
      {/* Rejected Reason - Show for event rejection or update request rejection */}
      {(showRejectionInfo || showUpdateRequestRejection) && rejectionReason && (
        <RejectedReason reason={rejectionReason} />
      )}

      <Grid container spacing={2}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EventField
                label="Event Name*"
                value={eventDetail.name}
                isRejected={isFieldRejected('name')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Event Type*"
                value={eventDetail.eventType}
                isRejected={isFieldRejected('event_type')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Start & End Date*"
                value={`${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)}`}
                isRejected={
                  isFieldRejected('start_date') || isFieldRejected('end_date')
                }
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Time*"
                value={`${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB`}
                isRejected={
                  isFieldRejected('start_date') || isFieldRejected('end_date')
                }
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Address*"
                value={eventDetail.address}
                isRejected={isFieldRejected('address')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="City*"
                value={eventDetail.city?.name}
                isRejected={isFieldRejected('city')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Google Maps Link*"
                value={eventDetail.mapLocationUrl}
                isRejected={isFieldRejected('map_location_url')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                isTextArea
                label="Event Description*"
                value={eventDetail.description}
                isRejected={isFieldRejected('description')}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* Right Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EventField
                isTextArea
                label="Terms & Condition*"
                value={eventDetail.termAndConditions}
                isRejected={isFieldRejected('term_and_conditions')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Admin Fee*"
                value={
                  eventDetail.adminFee < 100
                    ? `${eventDetail.adminFee}%`
                    : `Rp ${eventDetail.adminFee}`
                }
                isRejected={isFieldRejected('admin_fee')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Payment Method*"
                value={
                  eventDetail.paymentMethods
                    ?.map((pm) => pm.name)
                    .join(' / ') || ''
                }
                isRejected={isFieldRejected('payment_methods')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Website Url*"
                value={eventDetail.websiteUrl}
                isRejected={isFieldRejected('website_url')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Tax Nominal*"
                value={`${eventDetail.tax}%`}
                isRejected={isFieldRejected('tax')}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="User Must Login*"
                value={eventDetail.login_required ? 'Yes' : 'No'}
                isRejected={isFieldRejected('login_required')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <PreviewEventModal
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onConfirm={handlePreviewConfirm}
      />
    </>
  );
};
