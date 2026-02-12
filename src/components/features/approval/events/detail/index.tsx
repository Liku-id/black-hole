import { ErrorOutline } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useMemo } from 'react';

import { Body2 } from '@/components/common';
import { Checkbox } from '@/components/common/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentMethods } from '@/hooks';
import { EventDetail, EventUpdateRequest } from '@/types/event';
import { UserRole, isEventOrganizer } from '@/types/auth';
import { dateUtils } from '@/utils';

// Rejected Reason Component
const RejectedReason = ({ reason }: { reason: string | null }) => {
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

const Field = ({
  label,
  value,
  isTextArea = false,
  eventDetail,
  eventUpdateRequest,
  fieldKey,
  isRejected = false,
  paymentMethodMap
}: {
  label: React.ReactNode;
  value: string;
  isTextArea?: boolean;
  eventDetail?: any;
  eventUpdateRequest?: any;
  fieldKey?: string;
  isRejected?: boolean;
  paymentMethodMap?: Record<string, string>;
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
        return `${eventUpdateRequest?.city?.name}`;
      case 'paymentMethodIds':
        const names = (eventUpdateRequest[fieldKey] || [])
          .map((id: string) => paymentMethodMap?.[id] || id)
          .join(', ');
        return names;
      case 'feeThresholds':
        const platformFee = eventUpdateRequest.feeThresholds?.[0]?.platformFee;
        if (!platformFee) return '-';
        const fee = parseInt(platformFee);
        return fee < 100 ? `${fee}%` : `Rp ${fee.toLocaleString()}`;
      case 'login_required':
        return eventUpdateRequest[fieldKey] ? 'Yes' : 'No';
      default:
        return eventUpdateRequest[fieldKey] || '';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
        <Body2 color="text.secondary">{label}</Body2>
        {isRejected && <ErrorOutline fontSize="small" color="error" />}
      </Box>

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
  eventUpdateRequest?: EventUpdateRequest;
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
  const { paymentMethods } = usePaymentMethods();
  const { user } = useAuth();

  const isAdminOrBD = user && !isEventOrganizer(user) &&
    (user.role?.name === UserRole.ADMIN || user.role?.name === UserRole.BUSINESS_DEVELOPMENT);

  const paymentMethodMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(paymentMethods).forEach((methods) => {
      methods.forEach((pm: any) => {
        map[pm.id] = pm.name;
      });
    });
    return map;
  }, [paymentMethods]);

  // Check if we should use eventUpdateRequest rejection info
  const useUpdateRequestRejection =
    (eventDetail.eventStatus === 'on_going' ||
      eventDetail.eventStatus === 'approved') &&
    eventUpdateRequest !== null &&
    eventUpdateRequest !== undefined;

  const isFieldRejected = (fieldName: string) => {
    // Use eventUpdateRequest rejectedFields if applicable
    if (useUpdateRequestRejection) {
      if (!eventUpdateRequest?.rejectedFields) return false;
      return eventUpdateRequest.rejectedFields.includes(fieldName);
    }

    // Otherwise use eventDetail rejectedFields
    if (!eventDetail.rejectedFields) return false;
    return eventDetail.rejectedFields.includes(fieldName);
  };

  const renderLabel = (text: string, key: string | string[]) => {
    if (
      !rejectMode ||
      ((eventDetail.eventStatus === 'on_going' ||
        eventDetail.eventStatus === 'approved') &&
        (key === 'admin_fee' || key === 'tax'))
    ) {
      return text;
    }

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

  // Determine which rejection reason to display
  const rejectionReason = useUpdateRequestRejection
    ? eventUpdateRequest?.rejectedReason
    : eventDetail.rejectedReason;

  return (
    <>
      {/* Rejected Reason */}
      <RejectedReason reason={rejectionReason} />

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
                isRejected={isFieldRejected('name')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="eventType"
                label={renderLabel('Event Type*', 'event_type')}
                value={eventDetail.eventType}
                isRejected={isFieldRejected('event_type')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="startDate"
                label={renderLabel('Start & End Date*, Time*', ['start_date'])}
                value={`${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)} (${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB)`}
                isRejected={
                  isFieldRejected('start_date') || isFieldRejected('end_date')
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="address"
                label={renderLabel('Address*', 'address')}
                value={eventDetail.address}
                isRejected={isFieldRejected('address')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="mapLocationUrl"
                label={renderLabel('Google Maps Link*', 'map_location_url')}
                value={eventDetail.mapLocationUrl}
                isRejected={isFieldRejected('map_location_url')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="cityId"
                label={renderLabel('City*', 'city')}
                value={eventDetail.city?.name || '-'}
                isRejected={isFieldRejected('city')}
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
                isRejected={isFieldRejected('description')}
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
                isRejected={isFieldRejected('term_and_conditions')}
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
                isRejected={isFieldRejected('admin_fee')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                paymentMethodMap={paymentMethodMap}
                fieldKey="paymentMethodIds"
                label={renderLabel('Payment Method*', 'payment_methods')}
                value={
                  eventDetail.paymentMethods
                    ?.map((pm) => pm.name)
                    .join(' / ') || ''
                }
                isRejected={isFieldRejected('payment_methods')}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="websiteUrl"
                label={renderLabel('Website URL*', 'website_url')}
                value={eventDetail.websiteUrl || '-'}
                isRejected={isFieldRejected('website_url')}
              />
            </Grid>

            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="tax"
                label={renderLabel('Tax Nominal*', 'tax')}
                value={`${eventDetail.tax}%`}
                isRejected={isFieldRejected('tax')}
              />
            </Grid>

            {/* Platform Fee - Only visible for Admin and BD */}
            {isAdminOrBD && (
              <Grid item xs={12}>
                <Field
                  eventDetail={eventDetail}
                  eventUpdateRequest={eventUpdateRequest}
                  fieldKey="feeThresholds"
                  label="Platform Fee"
                  value={(() => {
                    const platformFeeValue = eventDetail.feeThresholds?.[0]?.platformFee;
                    if (!platformFeeValue) return '-';
                    const fee = parseInt(platformFeeValue);
                    return fee < 100 ? `${fee}%` : `Rp ${fee.toLocaleString()}`;
                  })()}
                  isRejected={false}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Field
                eventDetail={eventDetail}
                eventUpdateRequest={eventUpdateRequest}
                fieldKey="login_required"
                label={renderLabel('User Must Login*', 'login_required')}
                value={eventDetail.login_required ? 'Yes' : 'No'}
                isRejected={isFieldRejected('login_required')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
