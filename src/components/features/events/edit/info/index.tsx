import { Box, Grid, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  TextField,
  Select,
  TextArea,
  Button,
  Caption,
  Overline,
  DropdownSelector
} from '@/components/common';
import { EventDateModal } from '@/components/features/events/create/info/event-date-modal';
import { EventTimeModal } from '@/components/features/events/create/info/event-time-modal';
import { PaymentMethodSelector } from '@/components/features/events/create/info/payment-method-selector';
import { useCities, usePaymentMethods, useEventTypes } from '@/hooks';
import { EventDetail } from '@/types/event';
import { dateUtils } from '@/utils';
import { RejectedReason } from '../../detail/info';

// Admin Fee Type Options
const adminFeeTypeOptions = [
  { value: '%', label: '%' },
  { value: 'Rp', label: 'Rp' }
];

interface FormData {
  eventName: string;
  eventType: string;
  dateRange: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  startDate: string;
  endDate: string;
  address: string;
  googleMapsLink: string;
  websiteUrl: string;
  city: string;
  adminFee: string;
  adminFeeType: string;
  paymentMethod: string[];
  tax: string;
  taxNominal: string;
  eventDescription: string;
  termsAndConditions: string;
  loginRequired: number;
}

interface EventEditInfoProps {
  eventDetail: EventDetail;
  onSubmit?: (data: FormData) => void;
  error?: string;
}

export const EventEditInfo = ({
  eventDetail,
  onSubmit,
  error
}: EventEditInfoProps) => {
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const { eventTypes } = useEventTypes();
  const { cities } = useCities();
  const { paymentMethods } = usePaymentMethods();

  // Prepare date range and time range strings from existing data
  const dateRange =
    eventDetail.startDate && eventDetail.endDate
      ? `${dateUtils.formatDateMMMDYYYY(eventDetail.startDate)} - ${dateUtils.formatDateMMMDYYYY(eventDetail.endDate)}`
      : '';

  const timeRange =
    eventDetail.startDate && eventDetail.endDate
      ? `${dateUtils.formatTime(eventDetail.startDate)} - ${dateUtils.formatTime(eventDetail.endDate)} WIB`
      : '';

  const detectedTimezone = dateUtils.extractTimezone(
    eventDetail.startDate || ''
  );

  // Process Google Maps Link - remove https:// if present
  const processGoogleMapsLink = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '');
  };

  // Process Admin Fee - determine type and value based on amount
  const processAdminFee = (
    adminFee: number | undefined
  ): { fee: string; type: string } => {
    if (!adminFee) return { fee: '', type: '%' };

    if (adminFee < 100) {
      return { fee: adminFee.toString(), type: '%' };
    } else {
      return { fee: adminFee.toString(), type: 'Rp' };
    }
  };

  const { fee: adminFeeValue, type: adminFeeTypeValue } = processAdminFee(
    eventDetail.adminFee
  );

  const methods = useForm<FormData>({
    defaultValues: {
      eventName: eventDetail.name || '',
      eventType: eventDetail.eventType || '',
      dateRange: dateRange,
      timeRange: timeRange,
      startTime: eventDetail.startDate
        ? dateUtils.formatTime(eventDetail.startDate)
        : '00:00',
      endTime: eventDetail.endDate
        ? dateUtils.formatTime(eventDetail.endDate)
        : '00:00',
      timeZone: detectedTimezone,
      startDate: eventDetail.startDate || '',
      endDate: eventDetail.endDate || '',
      address: eventDetail.address || '',
      googleMapsLink: processGoogleMapsLink(eventDetail.mapLocationUrl || ''),
      websiteUrl: eventDetail.websiteUrl || '',
      city: eventDetail.city?.id || '',
      adminFee: adminFeeValue,
      adminFeeType: adminFeeTypeValue,
      paymentMethod: eventDetail.paymentMethods?.map((pm) => pm.id) || [],
      tax: eventDetail.tax ? 'true' : 'false',
      taxNominal: eventDetail.tax?.toString() || '',
      eventDescription: eventDetail.description || '',
      termsAndConditions: eventDetail.termAndConditions || '',
      loginRequired: eventDetail.login_required ? 1 : 2
    }
  });

  const { watch, setValue } = methods;
  const watchedDateRange = watch('dateRange');
  const watchedTimeRange = watch('timeRange');
  const watchedAdminFeeType = watch('adminFeeType');

  const eventTypeOptions = eventTypes.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));

  const cityOptions = cities.map((city) => ({
    value: city.id,
    label: city.name
  }));

  const handleDateSave = (dateRange: string) => {
    setValue('dateRange', dateRange);
    setDateModalOpen(false);
  };

  const handleTimeSave = (timeRange: string) => {
    setValue('timeRange', timeRange);
    setTimeModalOpen(false);
  };

  const handleFormSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data as FormData);
    }
  };

  const isFieldRejected = (field: string) => {
    return (
      eventDetail.eventStatus === 'rejected' &&
      eventDetail.rejectedFields?.includes(field)
    );
  };

  return (
    <>
      {/* Rejected Reason */}
      <RejectedReason reason={eventDetail.rejectedReason} />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Event Name*"
                name="eventName"
                placeholder="Your Event Name"
                rules={{
                  required: 'Event name is required'
                }}
                isRejected={isFieldRejected('name')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                fullWidth
                label="Event Type*"
                name="eventType"
                options={eventTypeOptions}
                placeholder="Select event type"
                rules={{
                  required: 'Event type is required'
                }}
                isRejected={isFieldRejected('event_type')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true
                }}
                label="Start & End Date*"
                name="dateRange"
                placeholder="Select date range"
                rules={{
                  required: 'Date range is required'
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'pointer'
                  }
                }}
                value={watchedDateRange}
                onClick={() => setDateModalOpen(true)}
                isRejected={
                  isFieldRejected('start_date') || isFieldRejected('end_date')
                }
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true
                }}
                label="Start & End Time*"
                name="timeRange"
                placeholder="Select time range"
                rules={{
                  required: 'Time range is required'
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'pointer'
                  }
                }}
                value={watchedTimeRange}
                onClick={() => setTimeModalOpen(true)}
                isRejected={
                  isFieldRejected('start_date') || isFieldRejected('end_date')
                }
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Address*"
                name="address"
                placeholder="Location"
                rules={{
                  required: 'Address is required'
                }}
                isRejected={isFieldRejected('address')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Google Maps Link*"
                name="googleMapsLink"
                placeholder="Location Link"
                rules={{
                  required: 'Google Maps link is required'
                }}
                startComponent={
                  <Caption color="text.primary">HTTPS://</Caption>
                }
                isRejected={isFieldRejected('map_location_url')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Website Url*"
                name="websiteUrl"
                placeholder="Website Url"
                rules={{
                  required: 'Website URL is required'
                }}
                isRejected={isFieldRejected('website_url')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                fullWidth
                label="City*"
                name="city"
                options={cityOptions}
                placeholder="Select City"
                rules={{
                  required: 'City is required'
                }}
                isRejected={isFieldRejected('city')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DropdownSelector
                        defaultLabel="%"
                        options={adminFeeTypeOptions}
                        selectedValue={watchedAdminFeeType}
                        onValueChange={(type) => setValue('adminFeeType', type)}
                        disabled={eventDetail.eventStatus === 'on_going'}
                      />
                    </InputAdornment>
                  )
                }}
                label="Admin Fee*"
                name="adminFee"
                placeholder={
                  watchedAdminFeeType === '%'
                    ? 'Admin fee percentage'
                    : 'Admin fee amount'
                }
                rules={{
                  required: 'Admin fee is required',
                  pattern: {
                    value: /^\d+$/,
                    message: 'Admin fee must be a number'
                  },
                  validate: (value) => {
                    if (watchedAdminFeeType === '%' && parseInt(value) >= 100) {
                      return 'Admin fee percentage must be less than 100%';
                    }
                    return true;
                  }
                }}
                disabled={eventDetail.eventStatus === 'on_going'}
                isRejected={isFieldRejected('admin_fee')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <PaymentMethodSelector
                fullWidth
                groupedPaymentMethods={paymentMethods}
                label="Payment Method*"
                name="paymentMethod"
                placeholder="Select payment methods for your event"
                rules={{
                  required: 'Payment method is required'
                }}
                isRejected={isFieldRejected('payment_methods')}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                endComponent={<Caption color="text.primary">%</Caption>}
                label="Tax Nominal*"
                name="taxNominal"
                placeholder="Tax percentage"
                rules={{
                  required: 'Tax nominal is required when tax is enabled',
                  pattern: {
                    value: /^\d+$/,
                    message: 'Tax nominal must be a number'
                  }
                }}
                isRejected={isFieldRejected('tax')}
                disabled={eventDetail.eventStatus === 'on_going'}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                id="select-login-required"
                fullWidth
                label="User Must Login*"
                name="loginRequired"
                options={[
                  { value: 1, label: 'Yes' },
                  { value: 2, label: 'No' }
                ]}
                placeholder="Select Yes or No"
                rules={{
                  required: 'Login requirement is required'
                }}
                isRejected={isFieldRejected('login_required')}
              />
            </Grid>
          </Grid>

          {/* TextArea fields - always on same row */}
          <Grid container marginTop={1} spacing={3}>
            <Grid item md={6} xs={12}>
              <TextArea
                fullWidth
                label="Event Description*"
                maxLength={3000}
                name="eventDescription"
                placeholder="Max. 3000 characters"
                rules={{
                  required: 'Event description is required'
                }}
                isRejected={isFieldRejected('description')}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextArea
                fullWidth
                label="Terms & Conditions*"
                name="termsAndConditions"
                placeholder="Your Terms & Condition for Event"
                rules={{
                  required: 'Terms and conditions are required'
                }}
                isRejected={isFieldRejected('term_and_conditions')}
              />
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box marginTop={4} textAlign="right">
            {error && (
              <Box marginBottom={2}>
                <Overline color="error.main">{error}</Overline>
              </Box>
            )}

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button type="submit" variant="primary">
                {eventDetail.eventStatus === 'approved' ||
                eventDetail.eventStatus === 'on_going'
                  ? 'Request Update Event'
                  : 'Update Event'}
              </Button>
            </Box>
          </Box>

          <EventDateModal
            open={dateModalOpen}
            onClose={() => setDateModalOpen(false)}
            onSave={handleDateSave}
          />

          <EventTimeModal
            open={timeModalOpen}
            onClose={() => setTimeModalOpen(false)}
            onSave={handleTimeSave}
          />
        </form>
      </FormProvider>
    </>
  );
};
