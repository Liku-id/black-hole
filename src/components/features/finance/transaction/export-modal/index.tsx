import { Box, Grid, Alert, CircularProgress } from '@mui/material';
import { FC, useState } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { useEvents, useExportTransactions } from '@/hooks';
import { Modal, Button, Select, DateField } from '@/components/common';
import { ExportTransactionsRequest } from '@/types/transaction';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  event_id?: string;
  from_date?: string;
  to_date?: string;
  payment_status?: string;
}

export const ExportModal: FC<ExportModalProps> = ({ open, onClose }) => {
  const { events, loading: eventsLoading } = useEvents();
  const { exportData, loading: exportLoading, error: exportError } = useExportTransactions();
  const [isSuccess, setIsSuccess] = useState(false);

  const eventOptions = [
    { value: '', label: 'All Events' },
    ...events.map((event) => ({
      value: event.id,
      label: event.name
    }))
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const methods = useForm<FormData>({
    defaultValues: {
      event_id: '',
      payment_status: ''
    }
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      const request: ExportTransactionsRequest = {};
      
      if (data.event_id) request.event_id = data.event_id;
      if (data.from_date) request.from_date = data.from_date;
      if (data.to_date) request.to_date = data.to_date;
      if (data.payment_status) request.payment_status = data.payment_status;

      await exportData(request);
      setIsSuccess(true);
      
      // Auto close modal after 2 seconds on success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        methods.reset();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    methods.reset();
    onClose();
  };

  return (
    <Modal
      footer={''}
      height={520}
      open={open}
      title="Export Transaction"
      width={400}
      onClose={handleClose}
    >
      <Box>
        {isSuccess && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            Export successful! File is being downloaded.
          </Alert>
        )}
        
        {exportError && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {exportError}
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Select Event"
                  name="event_id"
                  options={eventOptions}
                  placeholder={eventsLoading ? 'Loading events...' : 'Select event (optional)'}
                  disabled={eventsLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Payment Status"
                  name="payment_status"
                  options={paymentStatusOptions}
                  placeholder="Select payment status (optional)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <DateField
                  fullWidth
                  label="From Date"
                  name="from_date"
                  placeholder="Select from date (optional)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <DateField
                  fullWidth
                  label="To Date"
                  name="to_date"
                  placeholder="Select to date (optional)"
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button 
                variant="secondary" 
                onClick={handleClose}
                disabled={exportLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="primary" 
                disabled={exportLoading || eventsLoading}
                startIcon={exportLoading ? <CircularProgress size={16} /> : undefined}
              >
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};
