import { Box, Grid, InputAdornment } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Button, Modal, TextField, TextArea } from '@/components/common';

import { TicketDateModal } from '../date-modal';
import { SalesModal } from '../sales-modal';

interface TicketFormData {
  name: string;
  description: string;
  colorHex: string;
  price: string;
  quantity: string;
  maxPerUser: string;
  salesStartDate: string;
  salesStartRawDate: string;
  salesStartTime: string;
  salesStartTimeZone: string;
  salesEndDate: string;
  salesEndRawDate: string;
  salesEndTime: string;
  salesEndTimeZone: string;
  ticketStartDate: string;
  ticketStartRawDate: string;
  ticketEndDate: string;
  ticketEndRawDate: string;
}

interface TicketCategory {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  price: number;
  quantity: number;
  maxPerUser: number;
  salesStartDate: string;
  salesEndDate: string;
  ticketStartDate: string;
  ticketEndDate: string;
}

interface TicketCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => void;
  editingTicket?: TicketCategory;
}

export const TicketCreateModal = ({
  open,
  onClose,
  onSubmit,
  editingTicket
}: TicketCreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [salesStartModalOpen, setSalesStartModalOpen] = useState(false);
  const [salesEndModalOpen, setSalesEndModalOpen] = useState(false);
  const [ticketStartModalOpen, setTicketStartModalOpen] = useState(false);
  const [ticketEndModalOpen, setTicketEndModalOpen] = useState(false);

  const methods = useForm<TicketFormData>({
    defaultValues: {
      name: '',
      description: '',
      colorHex: '',
      price: '',
      quantity: '',
      maxPerUser: '',
      salesStartDate: '',
      salesEndDate: '',
      ticketStartDate: '',
      ticketEndDate: '',
      salesStartRawDate: '',
      salesEndRawDate: '',
      ticketStartRawDate: '',
      ticketEndRawDate: '',
      salesStartTime: '',
      salesEndTime: '',
      ticketStartTime: '',
      ticketEndTime: '',
      salesStartTimeZone: '',
      salesEndTimeZone: '',
      ticketStartTimeZone: '',
      ticketEndTimeZone: ''
    }
  });

  // Update form values when editingTicket changes
  useEffect(() => {
    if (editingTicket) {
      methods.reset({
        name: editingTicket.name,
        description: editingTicket.description,
        colorHex: editingTicket.colorHex,
        price: editingTicket.price.toString(),
        quantity: editingTicket.quantity.toString(),
        maxPerUser: editingTicket.maxPerUser.toString(),
        salesStartDate: editingTicket.salesStartDate,
        salesEndDate: editingTicket.salesEndDate,
        ticketStartDate: editingTicket.ticketStartDate,
        ticketEndDate: editingTicket.ticketEndDate
      });
    } else {
      methods.reset({
        name: '',
        description: '',
        colorHex: '',
        price: '',
        quantity: '',
        maxPerUser: '',
        salesStartDate: '',
        salesEndDate: '',
        ticketStartDate: '',
        ticketEndDate: ''
      });
    }
  }, [editingTicket, methods]);

  const { setValue, watch } = methods;
  const salesStartDate = watch('salesStartDate');
  const salesEndDate = watch('salesEndDate');
  const ticketStartDate = watch('ticketStartDate');
  const ticketEndDate = watch('ticketEndDate');

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
      methods.reset();
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const handleSalesStartSave = (data: {
    date: string;
    time: string;
    timeZone: string;
    formattedDate: string;
  }) => {
    // Store raw data for ISO conversion later
    setValue('salesStartDate', data.formattedDate);
    setValue('salesStartRawDate', data.date);
    setValue('salesStartTime', data.time);
    setValue('salesStartTimeZone', data.timeZone);
    setSalesStartModalOpen(false);
  };

  const handleSalesEndSave = (data: {
    date: string;
    time: string;
    timeZone: string;
    formattedDate: string;
  }) => {
    setValue('salesEndDate', data.formattedDate);
    setValue('salesEndRawDate', data.date);
    setValue('salesEndTime', data.time);
    setValue('salesEndTimeZone', data.timeZone);
    setSalesEndModalOpen(false);
  };

  const handleTicketStartSave = (data: {
    date: string;
    formattedDate: string;
  }) => {
    setValue('ticketStartDate', data.formattedDate);
    setValue('ticketStartRawDate', data.date);
    setTicketStartModalOpen(false);
  };

  const handleTicketEndSave = (data: {
    date: string;
    formattedDate: string;
  }) => {
    setValue('ticketEndDate', data.formattedDate);
    setValue('ticketEndRawDate', data.date);
    setTicketEndModalOpen(false);
  };

  return (
    <>
      <Modal
        height={500}
        open={open}
        title="Ticket Category"
        width={683}
        onClose={handleClose}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ticket Name*"
                  name="name"
                  placeholder="Ticket/Category Name"
                  rules={{
                    required: 'Ticket name is required'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextArea
                  fullWidth
                  label="Ticket Description*"
                  name="description"
                  placeholder="Max. 500 characters"
                  rules={{
                    required: 'Ticket description is required',
                    maxLength: {
                      value: 500,
                      message: 'Description must be less than 500 characters'
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">#</InputAdornment>
                    )
                  }}
                  label="Color Hex*"
                  name="colorHex"
                  placeholder=""
                  rules={{
                    required: 'Color hex is required',
                    pattern: {
                      value: /^[0-9A-Fa-f]{6}$/,
                      message: 'Please enter a valid hex color (e.g., FF0000)'
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">Rp</InputAdornment>
                    )
                  }}
                  label="Ticket Price*"
                  name="price"
                  placeholder=""
                  rules={{
                    required: 'Ticket price is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Price must be a number'
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Ticket Qty*"
                  name="quantity"
                  placeholder="Ticket quantity"
                  rules={{
                    required: 'Ticket quantity is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Quantity must be a number'
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">/User</InputAdornment>
                    )
                  }}
                  label="Max. Ticket Per User*"
                  name="maxPerUser"
                  placeholder="ex: 6 ticket per user"
                  rules={{
                    required: 'Max ticket per user is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Max ticket per user must be a number'
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true
                  }}
                  label="Sales Start Date*"
                  name="salesStartDate"
                  placeholder="Ticket sale will start on this date"
                  rules={{
                    required: 'Sales start date is required'
                  }}
                  value={salesStartDate}
                  onClick={() => setSalesStartModalOpen(true)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true
                  }}
                  label="Sales End Date*"
                  name="salesEndDate"
                  placeholder="Ticket sale will end on this date"
                  rules={{
                    required: 'Sales end date is required'
                  }}
                  value={salesEndDate}
                  onClick={() => setSalesEndModalOpen(true)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true
                  }}
                  label="Ticket Start Date*"
                  name="ticketStartDate"
                  placeholder="Ticket for date event"
                  rules={{
                    required: 'Ticket start date is required'
                  }}
                  value={ticketStartDate}
                  onClick={() => setTicketStartModalOpen(true)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true
                  }}
                  label="Ticket End Date*"
                  name="ticketEndDate"
                  placeholder="Ticket for date event"
                  rules={{
                    required: 'Ticket end date is required'
                  }}
                  value={ticketEndDate}
                  onClick={() => setTicketEndModalOpen(true)}
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
                {loading ? 'Saving...' : 'Save Ticket'}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Modal>

      {/* Sales Start Modal */}
      <SalesModal
        open={salesStartModalOpen}
        title="Sales Start Date"
        onClose={() => setSalesStartModalOpen(false)}
        onSave={handleSalesStartSave}
      />

      {/* Sales End Modal */}
      <SalesModal
        open={salesEndModalOpen}
        title="Sales End Date"
        onClose={() => setSalesEndModalOpen(false)}
        onSave={handleSalesEndSave}
      />

      {/* Ticket Start Modal */}
      <TicketDateModal
        open={ticketStartModalOpen}
        title="Ticket Start Date"
        onClose={() => setTicketStartModalOpen(false)}
        onSave={handleTicketStartSave}
      />

      {/* Ticket End Modal */}
      <TicketDateModal
        open={ticketEndModalOpen}
        title="Ticket End Date"
        onClose={() => setTicketEndModalOpen(false)}
        onSave={handleTicketEndSave}
      />
    </>
  );
};
