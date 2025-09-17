import { Box, Grid } from '@mui/material';
import { useRouter } from 'next/router';

import { Body2, Button, H3 } from '@/components/common';
import { EventDetail } from '@/types/event';
import { dateUtils } from '@/utils';

// EventField component
const EventField = ({
  label,
  value,
  isTextArea = false
}: {
  label: string;
  value: string;
  isTextArea?: boolean;
}) => (
  <Box>
    <Body2 color="text.secondary" mb={1}>
      {label}
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

interface EventDetailInfoProps {
  eventDetail: EventDetail;
}

export const EventDetailInfo = ({ eventDetail }: EventDetailInfoProps) => {
  const router = useRouter();
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
          eventDetail.is_requested === false && (
            <Button
              variant="primary"
              onClick={() => router.push(`/events/edit/${eventDetail.metaUrl}`)}
            >
              Edit Detail Event
            </Button>
          )}
      </Box>
      <Grid container spacing={2}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EventField label="Event Name*" value={eventDetail.name} />
            </Grid>
            <Grid item xs={12}>
              <EventField label="Event Type*" value={eventDetail.eventType} />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Start & End Date*"
                value={`${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)}`}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Time*"
                value={`${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB`}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField label="Address*" value={eventDetail.address} />
            </Grid>
            <Grid item xs={12}>
              <EventField
                label="Google Maps Link*"
                value={eventDetail.mapLocationUrl}
              />
            </Grid>
            <Grid item xs={12}>
              <EventField
                isTextArea
                label="Event Description*"
                value={eventDetail.description}
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
              />
            </Grid>
            <Grid item xs={12}>
              <EventField label="Website Url*" value={eventDetail.websiteUrl} />
            </Grid>
            <Grid item xs={12}>
              <EventField label="Tax*" value={eventDetail.tax ? 'Yes' : 'No'} />
            </Grid>
            <Grid item xs={12}>
              <EventField label="Tax Nominal*" value={`${eventDetail.tax}%`} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
