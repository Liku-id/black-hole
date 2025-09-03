import { Box } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Button, Modal, DateField } from '@/components/common';

interface TicketDateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { date: string; formattedDate: string }) => void;
  title: string;
}

export const TicketDateModal = ({
  open,
  onClose,
  onSave,
  title
}: TicketDateModalProps) => {
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      date: ''
    }
  });

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const date = new Date(data.date);
      const formattedDate = format(date, 'MMM d, yyyy');

      await onSave({
        date: data.date,
        formattedDate
      });
      methods.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save ticket date:', error);
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
      height={224}
      open={open}
      title={title}
      width={443}
      onClose={handleClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <DateField
            fullWidth
            label="Select Date"
            name="date"
            placeholder="Select date"
            rules={{
              required: 'Date is required'
            }}
          />
          <Box
            display="flex"
            gap={2}
            justifyContent="flex-end"
            marginTop="24px"
          >
            <Button disabled={loading} type="submit" variant="primary">
              {loading ? 'Saving...' : 'Save Data'}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};
