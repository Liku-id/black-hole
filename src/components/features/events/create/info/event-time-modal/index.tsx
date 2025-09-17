import { Box, Button, Grid } from '@mui/material';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Modal, TimeField, Select } from '@/components/common';

interface EventTimeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (timeRange: string) => void;
}

const timeZoneOptions = [
  { value: '+07:00', label: 'WIB' },
  { value: '+08:00', label: 'WITA' },
  { value: '+09:00', label: 'WIT' }
];

export const EventTimeModal: React.FC<EventTimeModalProps> = ({
  open,
  onClose,
  onSave
}) => {
  const { getValues, trigger } = useFormContext();
  const onSubmit = async () => {
    // Trigger validation for time fields
    const isStartTimeValid = await trigger('startTime');
    const isEndTimeValid = await trigger('endTime');
    const isTimeZoneValid = await trigger('timeZone');

    if (isStartTimeValid && isEndTimeValid && isTimeZoneValid) {
      const startTime = getValues('startTime');
      const endTime = getValues('endTime');
      const timeZone = getValues('timeZone');

      if (startTime && endTime && timeZone) {
        const selectedTimeZone = timeZoneOptions.find(
          (option) => option.value === timeZone
        );
        const timeZoneLabel = selectedTimeZone
          ? selectedTimeZone.label
          : timeZone;

        const formattedRange = `${startTime} - ${endTime} ${timeZoneLabel}`;
        onSave(formattedRange);
        onClose();
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} title="Select Time Range" onClose={handleClose}>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <TimeField
            label="Time Start"
            name="startTime"
            placeholder="00:00"
            rules={{
              required: 'Start time is required'
            }}
            value="00:00"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TimeField
            label="Time End"
            name="endTime"
            placeholder="00:00"
            rules={{
              required: 'End time is required'
            }}
            value="00:00"
          />
        </Grid>
        <Grid item xs={12}>
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
      <Box display="flex" justifyContent="flex-end" marginTop="48px">
        <Button variant="contained" onClick={onSubmit}>
          Save Data
        </Button>
      </Box>
    </Modal>
  );
};

export default EventTimeModal;
