import { Box, Grid, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  TextField,
  Card,
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

// Admin Fee Type Options
const adminFeeTypeOptions = [
  { value: '%', label: '%', id: 'admin_fee_percentage_option' },
  { value: 'Rp', label: 'Rp', id: 'admin_fee_rupiah_option' }
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

interface CreateEventFormProps {
  onSubmit: (data: FormData, isDraft?: boolean) => void;
  error?: string;
  loading: boolean;
}

export const CreateEventForm = ({
  onSubmit,
  error,
  loading
}: CreateEventFormProps) => {
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const { eventTypes } = useEventTypes();
  const { cities } = useCities();
  const { paymentMethods } = usePaymentMethods();

  const methods = useForm<FormData>({
    defaultValues: {
      eventName: '',
      eventType: '',
      dateRange: '',
      timeRange: '',
      startTime: '00:00',
      endTime: '00:00',
      timeZone: '+07:00',
      startDate: '',
      endDate: '',
      address: '',
      googleMapsLink: '',
      websiteUrl: '',
      city: '',
      adminFee: '',
      adminFeeType: '%',
      paymentMethod: [],
      tax: '',
      taxNominal: '',
      eventDescription: '',
      termsAndConditions: '',
      loginRequired: 1
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
    onSubmit(data as FormData, false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
        <Card>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                id="event_name_field"
                label="Event Name*"
                name="eventName"
                placeholder="Your Event Name"
                rules={{
                  required: 'Event name is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                fullWidth
                id="event_type_field"
                label="Event Type*"
                name="eventType"
                options={eventTypeOptions}
                placeholder="Select event type"
                rules={{
                  required: 'Event type is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                id="event_date_field"
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
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true
                }}
                id="event_time_field"
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
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                id="address_field"
                label="Address*"
                name="address"
                placeholder="Location"
                rules={{
                  required: 'Address is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                id="maps_url_field"
                label="Google Maps Link*"
                name="googleMapsLink"
                placeholder="Location Link"
                rules={{
                  required: 'Google Maps link is required'
                }}
                startComponent={
                  <Caption color="text.primary">HTTPS://</Caption>
                }
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                id="website_url_field"
                label="Website Url*"
                name="websiteUrl"
                placeholder="Website Url"
                rules={{
                  required: 'Website URL is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                fullWidth
                id="city_field"
                label="City*"
                name="city"
                options={cityOptions}
                placeholder="Select City"
                rules={{
                  required: 'City is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DropdownSelector
                        id="admin_fee_type_selector"
                        defaultLabel="%"
                        options={adminFeeTypeOptions}
                        selectedValue={watchedAdminFeeType}
                        onValueChange={(type) => setValue('adminFeeType', type)}
                      />
                    </InputAdornment>
                  )
                }}
                id="admin_fee_field"
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
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <PaymentMethodSelector
                fullWidth
                groupedPaymentMethods={paymentMethods}
                id="payment_method_field"
                label="Payment Method*"
                name="paymentMethod"
                placeholder="Select payment methods for your event"
                rules={{
                  required: 'Payment method is required'
                }}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                endComponent={<Caption color="text.primary">%</Caption>}
                id="tax_nominal_field"
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
              />
            </Grid>
          </Grid>

          {/* TextArea fields - always on same row */}
          <Grid container marginTop={1} spacing={3}>
            <Grid item md={6} xs={12}>
              <TextArea
                fullWidth
                id="event_desc_field"
                label="Event Description*"
                maxLength={3000}
                name="eventDescription"
                placeholder="Max. 3000 characters"
                rules={{
                  required: 'Event description is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextArea
                fullWidth
                id="terms_condition_field"
                label="Terms & Conditions*"
                name="termsAndConditions"
                placeholder="Your Terms & Condition for Event"
                rules={{
                  required: 'Terms and conditions are required'
                }}
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
              <Button disabled={loading} type="submit" variant="primary">
                Submit
              </Button>
            </Box>
          </Box>
        </Card>

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
  );
};
