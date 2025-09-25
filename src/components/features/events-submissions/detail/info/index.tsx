import { Box, Grid } from '@mui/material';

import { Body2 } from '@/components/common';
import { Checkbox } from '@/components/common/checkbox';
import { EventDetail } from '@/types/event';
import { dateUtils } from '@/utils';

const Field = ({
  label,
  value,
  isTextArea = false,
  eventDetail,
  eventUpdateRequest,
  fieldKey
}: {
  label: React.ReactNode;
  value: string;
  isTextArea?: boolean;
  eventDetail?: any;
  eventUpdateRequest?: any;
  fieldKey?: string;
}) => {
  // Check if field has changes
  const hasChanges =
    eventUpdateRequest &&
    fieldKey &&
    (() => {
      switch (fieldKey) {
        case 'startDate':
          const oldDateRange =
            eventDetail?.startDate && eventDetail?.endDate
              ? `${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)} (${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB)`
              : '';
          const newDateRange =
            eventUpdateRequest.startDate && eventUpdateRequest.endDate
              ? `${dateUtils.formatDateMMMDYYYY(eventUpdateRequest.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventUpdateRequest.endDate)} (${dateUtils.formatTime(eventUpdateRequest.startDate)} - ${dateUtils.formatTime(eventUpdateRequest.endDate)} WIB)`
              : '';
          return oldDateRange !== newDateRange;
        case 'cityId':
          return eventDetail?.city?.id !== eventUpdateRequest[fieldKey];
        case 'paymentMethodIds': {
          const a = (eventDetail?.paymentMethods ?? [])
            .map((pm) => pm.id)
            .filter(Boolean)
            .slice()
            .sort();

          const b = (eventUpdateRequest[fieldKey] ?? []).slice().sort();

          return JSON.stringify(a) !== JSON.stringify(b);
        }

        default:
          return eventDetail?.[fieldKey] !== eventUpdateRequest[fieldKey];
      }
    })();

  // Get new value
  const getNewValue = () => {
    if (!eventUpdateRequest || !fieldKey) return '';

    switch (fieldKey) {
      case 'startDate':
        if (eventUpdateRequest.startDate && eventUpdateRequest.endDate) {
          return `${dateUtils.formatDateMMMDYYYY(eventUpdateRequest.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventUpdateRequest.endDate)} (${dateUtils.formatTime(eventUpdateRequest.startDate)} - ${dateUtils.formatTime(eventUpdateRequest.endDate)} WIB)`;
        }
        return '';
      case 'cityId':
        return `City ID: ${eventUpdateRequest[fieldKey]}`;
      case 'paymentMethodIds':
        return `Payment Method IDs: ${eventUpdateRequest[fieldKey]?.join(', ') || ''}`;
      default:
        return eventUpdateRequest[fieldKey] || '';
    }
  };

  return (
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
        {hasChanges && (
          <Box mt={1}>
            <Body2 color="success.main" fontSize="12px">
              → {getNewValue()}
            </Body2>
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface EventsSubmissionsInfoProps {
  eventDetail: EventDetail;
  eventUpdateRequest?: any; // EventUpdateRequest type
  rejectMode?: boolean;
  selectedFields?: string[];
  onToggleField?: (fieldKey: string, checked: boolean) => void;
}

export const EventsSubmissionsInfo = ({
  eventDetail,
  eventUpdateRequest,
  rejectMode = false,
  selectedFields = [],
  onToggleField
}: EventsSubmissionsInfoProps) => {
  const renderLabel = (text: string, key: string | string[]) => {
    if (!rejectMode) return text;

    const keys = Array.isArray(key) ? key : [key];
    const checked = keys.every((k) => selectedFields.includes(k));

    return (
      <Box alignItems="center" display="flex" gap={1}>
        <Checkbox
          checked={checked}
          onChange={(e) => {
            if (onToggleField) {
              const isChecked = (e.target as HTMLInputElement).checked;
              keys.forEach((k) => onToggleField(k, isChecked));
            }
          }}
        />
        <span>{text}</span>
      </Box>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="name"
              label={renderLabel('Event Name*', 'name')}
              value={eventDetail.name}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="eventType"
              label={renderLabel('Event Type*', 'event_type')}
              value={eventDetail.eventType}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="startDate"
              label={renderLabel('Start & End Date*, Time*', ['start_date'])}
              value={`${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)} (${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB)`}
            />
          </Grid>

          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="address"
              label={renderLabel('Address*', 'address')}
              value={eventDetail.address}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="mapLocationUrl"
              label={renderLabel('Google Maps Link*', 'map_location_url')}
              value={eventDetail.mapLocationUrl}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="cityId"
              label={renderLabel('City*', 'city')}
              value={eventDetail.city?.name || '-'}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              isTextArea
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="description"
              label={renderLabel('Event Description*', 'description')}
              value={eventDetail.description}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item md={6} xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Field
              isTextArea
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="termAndConditions"
              label={renderLabel('Terms & Condition*', 'term_and_conditions')}
              value={eventDetail.termAndConditions}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="adminFee"
              label={renderLabel('Admin Fee*', 'admin_fee')}
              value={
                eventDetail.adminFee < 100
                  ? `${eventDetail.adminFee}%`
                  : `Rp ${eventDetail.adminFee}`
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="paymentMethodIds"
              label={renderLabel('Payment Method*', 'payment_methods')}
              value={
                eventDetail.paymentMethods?.map((pm) => pm.name).join(' / ') ||
                ''
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="websiteUrl"
              label={renderLabel('Website URL*', 'website_url')}
              value={eventDetail.websiteUrl || '-'}
            />
          </Grid>

          <Grid item xs={12}>
            <Field
              eventDetail={eventDetail}
              eventUpdateRequest={eventUpdateRequest}
              fieldKey="tax"
              label={renderLabel('Tax Nominal*', 'tax')}
              value={`${eventDetail.tax}%`}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
