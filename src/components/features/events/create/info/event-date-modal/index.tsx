import { Box, Grid } from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button, Modal, DateField } from '@/components/common';

interface EventDateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dateRange: string) => void;
}

export const EventDateModal: React.FC<EventDateModalProps> = ({
  open,
  onClose,
  onSave
}) => {
  const { getValues } = useFormContext();

  const onSubmit = () => {
    const startDate = getValues('startDate');
    const endDate = getValues('endDate');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const formattedRange = `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
      onSave(formattedRange);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} title="Start & End Date Event" onClose={handleClose}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DateField
            fullWidth
            id="start_date_field"
            label="Start Date*"
            name="startDate"
            placeholder="Select start date"
            rules={{
              required: 'Start date is required'
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <DateField
            fullWidth
            id="end_date_field"
            label="End Date*"
            name="endDate"
            placeholder="Select end date"
            rules={{
              required: 'End date is required'
            }}
          />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" marginTop="48px">
        <Button id="save_data_button" variant="primary" onClick={onSubmit}>
          Save Data
        </Button>
      </Box>
    </Modal>
  );
};

export default EventDateModal;
