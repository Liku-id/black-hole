import { Box } from '@mui/material';
import { useState } from 'react';

import { Body2, Button, TextField } from '@/components/common';
import Modal from '@/components/common/modal';

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  error?: string | null;
  rejectedFields?: string[];
  title?: string;
  message?: string;
  fieldDisplayMap?: Record<string, string>;
}

export const RejectModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error,
  rejectedFields = [],
  title,
  message,
  fieldDisplayMap
}: RejectModalProps) => {
  const [reason, setReason] = useState('');

  const defaultTitle = 'Reject Event Submission';
  const defaultMessage = 'Are you sure you want to reject this event submission?';

  return (
    <Modal
      footer={
        <Box display="flex" flexDirection="column" gap={1}>
          {error ? <Body2 color="error.main">{error}</Body2> : null}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button disabled={loading} variant="secondary" onClick={onClose}>
              No
            </Button>
            <Button
              disabled={loading || !reason.trim()}
              onClick={() => onConfirm(reason)}
            >
              Yes
            </Button>
          </Box>
        </Box>
      }
      height={320}
      open={open}
      title={title || defaultTitle}
      width={560}
      onClose={onClose}
    >
      <Body2 color="text.secondary" mb={2}>
        {message || defaultMessage}
      </Body2>

      {rejectedFields.length > 0 && (
        <Box mb={2}>
          <Body2 color="text.secondary" mb={1}>
            Rejected fields:
          </Body2>
          <Box
            bgcolor="error.light"
            border="1px solid"
            borderColor="error.main"
            borderRadius={1}
            p={1}
          >
            <Body2 color="error.main">
              {rejectedFields
                .map((field) => {
                  // First check if there's a custom display map provided
                  if (fieldDisplayMap && fieldDisplayMap[field]) {
                    return fieldDisplayMap[field];
                  }
                  
                  // Otherwise use default field labels
                  const fieldLabels: Record<string, string> = {
                    name: 'Event Name',
                    event_type: 'Event Type',
                    description: 'Event Description',
                    address: 'Address',
                    map_location_url: 'Google Maps Link',
                    start_date: 'Start & End Date, Time',
                    term_and_conditions: 'Terms & Conditions',
                    website_url: 'Website URL',
                    ticket_types: 'Ticket Types',
                    city: 'City',
                    payment_methods: 'Payment Methods',
                    admin_fee: 'Admin Fee',
                    tax: 'Tax Nominal',
                    login_required: 'User Must Login'
                  };
                  return fieldLabels[field] || field;
                })
                .join(', ')}
            </Body2>
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        placeholder="Enter rejection reason"
        value={reason}
        onChange={(e: any) => setReason(e.target.value)}
      />
    </Modal>
  );
};
