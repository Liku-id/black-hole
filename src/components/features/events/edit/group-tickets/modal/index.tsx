import { Box, Grid, InputAdornment } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Button, Modal, TextField, TextArea, Body2, Select } from '@/components/common';
import { TicketType } from '@/types/event';

import { SalesModal } from '../../../create/ticket/sales-modal';

interface GroupTicketFormData {
  ticketTypeId: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  bundleQuantity: string;
  maxOrderQuantity: string;
  salesStartDate: string;
  salesStartRawDate: string;
  salesStartTime: string;
  salesStartTimeZone: string;
  salesEndDate: string;
  salesEndRawDate: string;
  salesEndTime: string;
  salesEndTimeZone: string;
}

interface GroupTicketCategory {
  id: string;
  ticketTypeId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  bundleQuantity: number;
  maxOrderQuantity: number;
  salesStartDate: string;
  salesEndDate: string;
  status?: string;
  rejectedReason?: string;
  originalSalesStartDate?: string;
  originalSalesEndDate?: string;
}

interface GroupTicketCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GroupTicketFormData) => void;
  editingTicket?: GroupTicketCategory;
  eventStatus?: string;
  ticketTypes: TicketType[];
}

// Rejected Reason Component
const RejectedReason = ({ reason }: { reason?: string }) => {
  if (!reason || reason.trim() === '') return null;

  return (
    <Box mb={2}>
      <Box
        border="1px solid"
        borderColor="error.main"
        borderRadius={1}
        p="12px 16px"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'error.light',
          borderLeft: '4px solid',
          borderLeftColor: 'error.main'
        }}
      >
        <Body2 color="error.dark" fontWeight={500}>
          Rejection Reason:
        </Body2>
        <Body2 color="text.primary">{reason}</Body2>
      </Box>
    </Box>
  );
};

export const GroupTicketCreateModal = ({
  open,
  onClose,
  onSubmit,
  editingTicket,
  eventStatus,
  ticketTypes
}: GroupTicketCreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [salesStartModalOpen, setSalesStartModalOpen] = useState(false);
  const [salesEndModalOpen, setSalesEndModalOpen] = useState(false);

  // Show rejection info if event status is rejected, draft, or on_going AND ticket status is rejected
  const shouldShowRejectionInfo = 
    (eventStatus === 'rejected' || eventStatus === 'draft' || eventStatus === 'on_going') && 
    editingTicket?.status === 'rejected';

  const methods = useForm<GroupTicketFormData>({
    defaultValues: {
      ticketTypeId: '',
      name: '',
      description: '',
      price: '',
      quantity: '',
      bundleQuantity: '',
      maxOrderQuantity: '',
      salesStartDate: '',
      salesEndDate: '',
      salesStartRawDate: '',
      salesEndRawDate: '',
      salesStartTime: '',
      salesEndTime: '',
      salesStartTimeZone: '',
      salesEndTimeZone: ''
    }
  });

  // Update form values when editingTicket changes
  useEffect(() => {
    if (editingTicket) {
      methods.reset({
        ticketTypeId: editingTicket.ticketTypeId,
        name: editingTicket.name,
        description: editingTicket.description,
        price: editingTicket.price.toString(),
        quantity: editingTicket.quantity.toString(),
        bundleQuantity: editingTicket.bundleQuantity.toString(),
        maxOrderQuantity: editingTicket.maxOrderQuantity.toString(),
        salesStartDate: editingTicket.salesStartDate,
        salesEndDate: editingTicket.salesEndDate
      });
    } else {
      methods.reset({
        ticketTypeId: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        bundleQuantity: '',
        maxOrderQuantity: '',
        salesStartDate: '',
        salesEndDate: ''
      });
    }
  }, [editingTicket, methods]);

  const { setValue, watch } = methods;
  const salesStartDate = watch('salesStartDate');
  const salesEndDate = watch('salesEndDate');

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
      methods.reset();
      onClose();
    } catch (error) {
      console.error('Failed to create group ticket:', error);
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

  return (
    <>
      <Modal
        height={650}
        open={open}
        title="Group Ticket"
        width={683}
        onClose={handleClose}
        footer={
          <Box
            display="flex"
            gap={2}
            justifyContent="flex-end"
          >
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              disabled={loading} 
              type="submit" 
              variant="primary"
              onClick={methods.handleSubmit(handleSubmit)}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        }
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            {/* Show rejected reason if applicable */}
            {shouldShowRejectionInfo && (
              <RejectedReason reason={editingTicket?.rejectedReason} />
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Ticket Type*"
                  name="ticketTypeId"
                  placeholder="Select ticket type"
                  options={ticketTypes.map((ticketType) => ({
                    value: ticketType.id,
                    label: ticketType.name
                  }))}
                  rules={{
                    required: 'Ticket type is required'
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Ticket Name*"
                  name="name"
                  placeholder="VIP - Group Ticket 5"
                  rules={{
                    required: 'Ticket name is required'
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Bundle Qty*"
                  name="bundleQuantity"
                  placeholder="5"
                  rules={{
                    required: 'Bundle quantity is required',
                    pattern: {
                      value: /^\d+$/,
                      message: 'Bundle quantity must be a number'
                    }
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
                  label="Ticket Type Qty*"
                  name="quantity"
                  placeholder="Ticket type quantity"
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
                  name="maxOrderQuantity"
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
            </Grid>
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
    </>
  );
};
