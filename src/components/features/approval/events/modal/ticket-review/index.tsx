import { Box, Checkbox, Grid, IconButton, Modal } from '@mui/material';
import { useState } from 'react';
import { Close, ErrorOutline } from '@mui/icons-material';

import { Body1, Body2, Button, H3, Overline } from '@/components/common';
import { TicketType } from '@/types/event';
import { dateUtils, formatUtils } from '@/utils';

interface TicketReviewModalProps {
  open: boolean;
  ticket: TicketType | null;
  onClose: () => void;
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string, rejectedFields: string[]) => void;
  loading?: boolean;
  error?: string | null;
}

const ticketFields = [
  { key: 'name', label: 'Ticket Name' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'max_order_quantity', label: 'Max Order Quantity' },
  { key: 'sales_start_date', label: 'Sales Start Date' },
  { key: 'sales_end_date', label: 'Sales End Date' },
  { key: 'ticketStartDate', label: 'Ticket Start Date' },
  { key: 'ticketEndDate', label: 'Ticket End Date' }
];

export const TicketReviewModal = ({
  open,
  ticket,
  onClose,
  onApprove,
  onReject,
  loading = false,
  error = null
}: TicketReviewModalProps) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleClose = () => {
    setRejectMode(false);
    setSelectedFields([]);
    onClose();
  };

  const handleApprove = () => {
    if (ticket) {
      onApprove(ticket.id);
    }
  };

  const handleRejectSubmit = () => {
    if (ticket && selectedFields.length > 0) {
      onReject(ticket.id, selectedFields);
      handleClose();
    }
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const getFieldValue = (fieldKey: string): string => {
    if (!ticket) return '';

    switch (fieldKey) {
      case 'name':
        return ticket.name;
      case 'description':
        return ticket.description;
      case 'price':
        return formatUtils.formatCurrency(ticket.price);
      case 'quantity':
        return ticket.quantity.toString();
      case 'max_order_quantity':
        return ticket.max_order_quantity.toString();
      case 'sales_start_date':
        return dateUtils.formatDateTimeWIB(ticket.sales_start_date);
      case 'sales_end_date':
        return dateUtils.formatDateTimeWIB(ticket.sales_end_date);
      case 'ticketStartDate':
        return dateUtils.formatDateDDMMYYYY(ticket.ticketStartDate);
      case 'ticketEndDate':
        return dateUtils.formatDateDDMMYYYY(ticket.ticketEndDate);
      default:
        return '';
    }
  };

  if (!ticket) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        bgcolor="background.paper"
        borderRadius={2}
        boxShadow={24}
        maxHeight="90vh"
        overflow="auto"
        p={4}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '700px' }
        }}
      >
        {/* Header with Title and Close Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <H3 color="text.primary" fontWeight={700}>
            Review Ticket: {ticket.name}
          </H3>
          <IconButton 
            onClick={handleClose}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Ticket Details */}
        <Grid container spacing={2} mb={3}>
          {ticketFields.map((field) => (
            <Grid key={field.key} item xs={12} sm={6}>
              <Box>
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <Body2 color="text.secondary">{field.label}</Body2>
                  {rejectMode && (
                    <Checkbox
                      size="small"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                    />
                  )}
                  {rejectMode && selectedFields.includes(field.key) && (
                    <ErrorOutline fontSize="small" color="error" />
                  )}
                </Box>
                <Box
                  border="1px solid"
                  borderColor={
                    rejectMode && selectedFields.includes(field.key)
                      ? 'error.main'
                      : 'primary.main'
                  }
                  borderRadius={1}
                  p="12px 16px"
                  sx={{
                    backgroundColor: rejectMode && selectedFields.includes(field.key)
                      ? 'error.light'
                      : 'primary.light'
                  }}
                >
                  <Body2 color="text.primary">{getFieldValue(field.key)}</Body2>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Additional Forms */}
        {ticket.additional_forms && ticket.additional_forms.length > 0 && (
          <Box mb={3}>
            <Body1 color="text.primary" fontWeight={600} mb={2}>
              Additional Forms
            </Body1>
            {ticket.additional_forms.map((form, index) => (
              <Box key={form.id} mb={2}>
                <Body2 color="text.secondary" mb={1}>
                  {index + 1}. {form.field} ({form.type})
                  {form.isRequired && ' *'}
                </Body2>
              </Box>
            ))}
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Overline color="error.main" mb={2}>
            {error}
          </Overline>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          {!rejectMode ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setRejectMode(true)}
                disabled={loading}
              >
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectMode(false);
                  setSelectedFields([]);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={loading || selectedFields.length === 0}
              >
                Submit Rejection
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

