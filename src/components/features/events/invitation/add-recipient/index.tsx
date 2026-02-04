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
  const { handleSubmit, reset } = methods;

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
  


  // Map ticket types to dropdown options
  const ticketTypeOptions = ticketTypes.map((ticket) => ({
    value: ticket.id,
    label: ticket.name
  }));
  


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
                    placeholder="Recipient Email"
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
                      type="number"
                      rules={{ 
                        required: 'Phone number is required',
                      }}
                      fullWidth
                      sx={{
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                          WebkitAppearance: "none",
                          margin: 0,
                        },
                        "& input[type=number]": {
                          MozAppearance: "textfield",
                        },
                      }}
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
                  <TextField
                      name="ticketQty"
                      type="number"
                      placeholder="Ticket quantity"
                      fullWidth
                      rules={{ 
                        required: 'Ticket Quantity is required',
                        min: {
                          value: 1,
                          message: "Quantity must be at least 1"
                        }
                      }}
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
