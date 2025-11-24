import { Box, Grid } from '@mui/material';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Button,
  Modal,
  DateField,
  TimeField,
  Select
} from '@/components/common';

interface ExpiredDateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    date: string;
    time: string;
    timeZone: string;
    formattedDate: string;
    isoDate: string;
  }) => void;
  initialValue?: string;
}

const timeZoneOptions = [
  { value: '+07:00', label: 'WIB' },
  { value: '+08:00', label: 'WITA' },
  { value: '+09:00', label: 'WIT' }
];

export const ExpiredDateModal = ({
  open,
  onClose,
  onSave,
  initialValue
}: ExpiredDateModalProps) => {
  const [loading, setLoading] = useState(false);

  // Parse initial value if provided
  const parseInitialValue = () => {
    if (!initialValue) {
      return {
        date: '',
        time: '12:00',
        timeZone: '+07:00'
      };
    }

    try {
      const date = new Date(initialValue);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;

      // Extract timezone from ISO string or default to WIB
      const timeZoneMatch = initialValue.match(/([+-]\d{2}):(\d{2})$/);
      const timeZone = timeZoneMatch
        ? `${timeZoneMatch[1]}:${timeZoneMatch[2]}`
        : '+07:00';

      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      return {
        date: dateStr,
        time,
        timeZone
      };
    } catch {
      return {
        date: '',
        time: '12:00',
        timeZone: '+07:00'
      };
    }
  };

  const methods = useForm({
    defaultValues: parseInitialValue()
  });

  // Update form when initialValue changes
  useEffect(() => {
    const parsed = parseInitialValue();
    methods.reset(parsed);
  }, [initialValue, open]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (!data.date) {
        return;
      }

      // Parse date and time from form data
      const [hours, minutes] = data.time.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes.padStart(2, '0');

      // Get timezone offset
      const timeZoneOffset = data.timeZone;
      const timeZoneLabel =
        timeZoneOptions.find((option) => option.value === data.timeZone)
          ?.label || 'WIB';

      // Create ISO string with timezone directly without UTC conversion
      // Format: YYYY-MM-DDTHH:mm:ss.SSS+TZ:TZ
      // Use the date string directly from form (YYYY-MM-DD format)
      const isoDate = `${data.date}T${formattedHours}:${formattedMinutes}:00.000${timeZoneOffset}`;

      // For display formatting, create date object (this is only for display)
      const date = new Date(data.date);
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));

      // Format for display: "15 January 2026, 12.00 WIB" (with dot instead of colon)
      const timeFormatted = data.time.replace(':', '.');
      const formattedDate = `${format(date, 'd MMMM yyyy')}, ${timeFormatted} ${timeZoneLabel}`;

      await onSave({
        date: data.date,
        time: data.time,
        timeZone: data.timeZone,
        formattedDate,
        isoDate
      });
      onClose();
    } catch (error) {
      console.error('Failed to save expired date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Link Expired Date"
      onClose={handleClose}
      width={443}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DateField
                fullWidth
                id="date_field"
                label="Date"
                name="date"
                placeholder="Select end date"
                minDate={new Date()}
                rules={{
                  required: 'Date is required',
                  validate: (value: string) => {
                    if (!value) return true; // Required validation is handled separately
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    selectedDate.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                      return 'Date cannot be before today';
                    }
                    return true;
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimeField
                id="time_field"
                label="Time"
                name="time"
                placeholder="00:00"
                rules={{
                  required: 'Time is required'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                id="time_zone_field"
                fullWidth
                label="Time Zone*"
                name="timeZone"
                options={timeZoneOptions}
                placeholder="Select time zone"
                rules={{
                  required: 'Time zone is required'
                }}
              />
            </Grid>
          </Grid>
          <Box
            display="flex"
            gap={2}
            justifyContent="flex-end"
            marginTop="24px"
          >
            <Button
              id="save_time_button"
              disabled={loading}
              type="submit"
              variant="primary"
            >
              {loading ? 'Saving...' : 'Save Time'}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};
