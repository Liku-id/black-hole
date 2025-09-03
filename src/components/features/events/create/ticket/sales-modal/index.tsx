import { Box, Grid } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Button,
  Modal,
  DateField,
  TimeField,
  Select
} from '@/components/common';

interface SalesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    date: string;
    time: string;
    timeZone: string;
    formattedDate: string;
  }) => void;
  title: string;
}

const timeZoneOptions = [
  { value: '+07:00', label: 'WIB' },
  { value: '+08:00', label: 'WITA' },
  { value: '+09:00', label: 'WIT' }
];

export const SalesModal = ({
  open,
  onClose,
  onSave,
  title
}: SalesModalProps) => {
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      date: '',
      time: '00:00',
      timeZone: '+07:00'
    }
  });

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const date = new Date(data.date);
      const timeZoneLabel =
        timeZoneOptions.find((option) => option.value === data.timeZone)
          ?.label || 'WIB';
      const formattedDate = `${format(date, 'MMM d, yyyy')} ${data.time} ${timeZoneLabel}`;

      await onSave({
        date: data.date,
        time: data.time,
        timeZone: data.timeZone,
        formattedDate
      });
      methods.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save sales date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Modal open={open} title={title} onClose={handleClose}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DateField
                fullWidth
                label="Start Date"
                name="date"
                placeholder="Select date"
                rules={{
                  required: 'Date is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TimeField
                label="Time Start"
                name="time"
                placeholder="00:00"
                rules={{
                  required: 'Time is required'
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Select
                fullWidth
                label="Time Zone"
                name="timeZone"
                options={timeZoneOptions}
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
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type="submit" variant="primary">
              {loading ? 'Saving...' : 'Save Date'}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};
