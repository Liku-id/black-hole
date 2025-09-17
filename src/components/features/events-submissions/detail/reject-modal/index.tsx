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
}

export const RejectModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error,
  rejectedFields = []
}: RejectModalProps) => {
  const [reason, setReason] = useState('');

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
      title="Reject Event Submission"
      width={560}
      onClose={onClose}
    >
      <Body2 color="text.secondary" mb={2}>
        Are you sure you want to reject this event submission?
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
                    tax: 'Tax Nominal'
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
