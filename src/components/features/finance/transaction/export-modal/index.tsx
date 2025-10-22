import { Box, Grid, CircularProgress } from '@mui/material';
import { FC } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { useEvents, useExportTransactions } from '@/hooks';
import { Modal, Button, Select, DateField } from '@/components/common';
import { ExportTransactionsRequest } from '@/types/transaction';
import { useToast } from '@/contexts/ToastContext';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  eventId?: string;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
}

export const ExportModal: FC<ExportModalProps> = ({ open, onClose }) => {
  const { events, loading: eventsLoading } = useEvents();
  const { exportData, loading: exportLoading } = useExportTransactions();
  const { showInfo, showError } = useToast();

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
      eventId: '',
      paymentStatus: ''
    }
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      const request: ExportTransactionsRequest = {};

      if (data.eventId) request.event_id = data.eventId;
      if (data.fromDate) request.from_date = data.fromDate;
      if (data.toDate) request.to_date = data.toDate;
      if (data.paymentStatus) request.payment_status = data.paymentStatus;

      // Get event name for filename
      const selectedEvent = events.find((event) => event.id === data.eventId);
      const eventName = selectedEvent?.name;

      await exportData(request, eventName);
      showInfo('Export successful! File is being downloaded');
    } catch (error: any) {
      showError(error?.message || 'Failed to export transactions');
    }
  };

  const handleClose = () => {
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
      <Box position="relative" minHeight="100%">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  id="select_event_field"
                  fullWidth
                  label="Select Event"
                  name="eventId"
                  options={eventOptions}
                  placeholder={
                    eventsLoading
                      ? 'Loading events...'
                      : 'Select event (optional)'
                  }
                  disabled={eventsLoading}
                />
              </Grid>

              <Grid item xs={12}>
                <Select
                  id="payment_status_field"
                  fullWidth
                  label="Payment Status"
                  name="paymentStatus"
                  options={paymentStatusOptions}
                  placeholder="Select payment status (optional)"
                />
              </Grid>

              <Grid item xs={12}>
                <DateField
                  id="from_date_field"
                  fullWidth
                  label="From Date"
                  name="fromDate"
                  placeholder="Select from date (optional)"
                />
              </Grid>

              <Grid item xs={12}>
                <DateField
                  id="to_date_field"
                  fullWidth
                  label="To Date"
                  name="toDate"
                  placeholder="Select to date (optional)"
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={7}>
              <Button
                id="cancel_button"
                variant="secondary"
                onClick={handleClose}
                disabled={exportLoading}
              >
                Cancel
              </Button>
              <Button
                id="export_csv_button"
                type="submit"
                variant="primary"
                disabled={exportLoading || eventsLoading}
                startIcon={
                  exportLoading ? <CircularProgress size={16} /> : undefined
                }
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
