import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Button,
  TextField,
  Select,
  PhoneField,
  Body2
} from '@/components/common';
import CustomModal from '@/components/common/modal';
import { TicketType } from '@/types/event';

interface AddNewRecipientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  ticketTypes: TicketType[];
  defaultValues?: any;
}

export const AddNewRecipientModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  ticketTypes = [],
  defaultValues
}: AddNewRecipientModalProps) => {
  const methods = useForm({
    defaultValues: {
      recipientName: '',
      email: '',
      phoneNumber: '',
      ticketType: '',
      ticketQty: '',
      ...defaultValues
    }
  });
  const { handleSubmit, watch, reset } = methods;

  // Reset form when modal opens or defaultValues change
  useEffect(() => {
    if (open) {
      reset({
        recipientName: '',
        email: '',
        phoneNumber: '',
        ticketType: '',
        ticketQty: '',
        ...defaultValues
      });
    }
  }, [open, defaultValues, reset]);
  
  // Watch ticketType for dynamic quantity logic
  const watchedTicketType = watch('ticketType');

  // Map ticket types to dropdown options
  const ticketTypeOptions = ticketTypes.map((ticket) => ({
    value: ticket.id,
    label: ticket.name
  }));
  
  // Determine ticket quantities based on selected ticket type
  const selectedTicketObj = ticketTypes.find((t) => t.id === watchedTicketType);
  const remainingQty = selectedTicketObj 
    ? (selectedTicketObj.quantity - (selectedTicketObj.purchased_amount || 0)) 
    : 0;

  const ticketQuantities = remainingQty > 0 
    ? Array.from({ length: remainingQty }, (_, i) => ({ 
        value: String(i + 1), 
        label: String(i + 1) 
      }))
    : [];

  const handleFormSubmit = (data: any) => {
      onSubmit(data);
  };

  const isEdit = !!defaultValues;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Recipient" : "Add new Recipient"}
      width={700}
      height="auto"
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box display="flex" flexDirection="column" gap={3}>
              
            {/* Recipient Name */}
            <Box>
              <Body2 color="text.secondary" mb={1} fontWeight={600}>Recipient Name*</Body2>
              <TextField
                name="recipientName"
                placeholder="Recipient Name"
                rules={{ required: 'Recipient Name is required' }}
                fullWidth
              />
            </Box>

            <Box display="flex" gap={2}>
              {/* Email */}
              <Box flex={1}>
                  <Body2 color="text.secondary" mb={1} fontWeight={600}>Email*</Body2>
                  <TextField
                    name="email"
                    placeholder="Recipinet Email"
                    rules={{ 
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    }}
                    fullWidth
                  />
              </Box>

              {/* Phone Number */}
              <Box flex={1}>
                  <Body2 color="text.secondary" mb={1} fontWeight={600}>Phone Number</Body2>
                  <PhoneField 
                      name="phoneNumber"
                      placeholder="Recipient Phone Number"
                      rules={{ required: 'Phone number is required' }}
                      fullWidth
                  />
              </Box>
            </Box>

            <Box display="flex" gap={2}>
                {/* Ticket Type */}
                <Box flex={1}>
                  <Body2 color="text.secondary" mb={1} fontWeight={600}>Ticket Type*</Body2>
                  <Select
                      name="ticketType"
                      options={ticketTypeOptions}
                      placeholder="Choose Ticket Type"
                      fullWidth
                      rules={{ required: 'Ticket Type is required' }}
                  />
                </Box>

                {/* Qty Ticket */}
                <Box flex={1}>
                  <Body2 color="text.secondary" mb={1} fontWeight={600}>Qty Ticket*</Body2>
                  <Select
                      name="ticketQty"
                      options={ticketQuantities}
                      placeholder="Ticket quantity"
                      fullWidth
                      disabled={!watchedTicketType}
                      rules={{ required: 'Ticket Quantity is required' }}
                  />
                </Box>
            </Box>

            {/* Button */}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button type="submit" disabled={loading} sx={{ width: '200px' }}>
                {isEdit ? "Save Changes" : "Save Recipient"}
              </Button>
            </Box>
          </Box>
        </form>
      </FormProvider>
    </CustomModal>
  );
};
