import { Box, useTheme } from '@mui/material';
import { FC } from 'react';

import { Body2, Caption, Modal } from '@/components/common';
import { TicketType } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketType | null;
}

export const TicketDetailModal: FC<TicketDetailModalProps> = ({
  open,
  onClose,
  ticket
}) => {
  const theme = useTheme();
  return (
    <Modal height={500} open={open} title="Ticket Details" onClose={onClose}>
      {ticket && (
        <Box display="flex" flexDirection="column" gap="12px">
          {/* Ticket Name */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Ticket Name
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.name}
            </Body2>
          </Box>

          {/* Price */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Price
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {formatPrice(ticket.price)}
            </Body2>
          </Box>

          {/* Quantity Available */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Quantity Available
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.quantity} tickets
            </Body2>
          </Box>

          {/* Max Order Per User */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Max Order Per User
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.max_order_quantity} tickets
            </Body2>
          </Box>

          {/* Sales Start Date */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Sales Start Date
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.sales_start_date
                ? dateUtils.formatDateTimeWIB(ticket.sales_start_date)
                : 'Not set'}
            </Body2>
          </Box>

          {/* Sales End Date */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Sales End Date
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.sales_end_date
                ? dateUtils.formatDateTimeWIB(ticket.sales_end_date)
                : 'Not set'}
            </Body2>
          </Box>

          {/* Ticket Start Date */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Ticket Start Date
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.ticketStartDate
                ? dateUtils.formatDateTimeWIB(ticket.ticketStartDate)
                : 'Not set'}
            </Body2>
          </Box>

          {/* Ticket End Date */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Ticket End Date
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.ticketEndDate
                ? dateUtils.formatDateTimeWIB(ticket.ticketEndDate)
                : 'Not set'}
            </Body2>
          </Box>

          {/* Color */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Body2 color="text.secondary" fontSize="14px">
              Color
            </Body2>
            <Box
              border={`0.5px solid ${theme.palette.grey[100]}`}
              padding="4px 12px"
              sx={{
                backgroundColor: `#${ticket.color_hex}`
              }}
            >
              <Caption color="text.primary">#{ticket.color_hex}</Caption>
            </Box>
          </Box>

          {/* Description - Full width at bottom */}
          <Box mt={1}>
            <Body2 color="text.secondary" fontSize="14px" mb={1}>
              Description
            </Body2>
            <Body2 color="text.primary" fontSize="14px">
              {ticket.description || 'No description available'}
            </Body2>
          </Box>
        </Box>
      )}
    </Modal>
  );
};
