import { Box, useTheme } from '@mui/material';
import { FC, useState } from 'react';

import { Body2, Caption, Modal, Tabs } from '@/components/common';
import { TicketType, GroupTicket } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketType | GroupTicket | null;
}

export const TicketDetailModal: FC<TicketDetailModalProps> = ({
  open,
  onClose,
  ticket
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('detail');

  // Type guard to check if ticket is a GroupTicket
  const isGroupTicket = (ticket: TicketType | GroupTicket | null): ticket is GroupTicket => {
    return ticket !== null && 'ticket_type_id' in ticket;
  };

  const tabs = [
    { id: 'detail', title: 'Detail Ticket' },
    { id: 'additional', title: 'Additional Question' }
  ];

  const renderDetailTicket = () => {
    // Helper to get field from ticket or nested ticket_type (for GroupTicket)
    const getField = (field: keyof TicketType) => {
      // @ts-ignore
      return ticket[field] ?? ticket.ticket_type?.[field];
    };

    const ticketStartDate = getField('ticketStartDate');
    const ticketEndDate = getField('ticketEndDate');
    const colorHex = getField('color_hex');

    return (
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

          {/* Bundle Quantity - Only for Group Tickets */}
          {isGroupTicket(ticket) && 'bundle_quantity' in ticket && (
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
            >
              <Body2 color="text.secondary" fontSize="14px">
                Bundle Quantity
              </Body2>
              <Body2 color="text.primary" fontSize="14px">
                {ticket.bundle_quantity} tickets
              </Body2>
            </Box>
          )}

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

          {/* Ticket Start Date - Only for regular tickets */}
          {!isGroupTicket(ticket) && (
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
            >
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Start Date
              </Body2>
              <Body2 color="text.primary" fontSize="14px">
                {ticketStartDate
                  ? dateUtils.formatDateTimeWIB(ticketStartDate)
                  : 'Not set'}
              </Body2>
            </Box>
          )}

          {/* Ticket End Date - Only for regular tickets */}
          {!isGroupTicket(ticket) && (
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
            >
              <Body2 color="text.secondary" fontSize="14px">
                Ticket End Date
              </Body2>
              <Body2 color="text.primary" fontSize="14px">
                {ticketEndDate
                  ? dateUtils.formatDateTimeWIB(ticketEndDate)
                  : 'Not set'}
              </Body2>
            </Box>
          )}

          {/* Color - Only for regular tickets */}
          {!isGroupTicket(ticket) && colorHex && (
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
                  backgroundColor: `#${colorHex}`
                }}
              >
                <Caption color="text.primary">#{colorHex}</Caption>
              </Box>
            </Box>
          )}

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
      );
  };

  const renderAdditionalQuestion = () => {
    // @ts-ignore
    const additionalForms = ticket?.additional_forms || ticket?.ticket_type?.additional_forms || [];
    
    if (additionalForms.length === 0) {
      return (
        <Box display="flex" flexDirection="column" gap="4px">
          <Body2 color="text.secondary" fontSize="14px">
            Tidak ada pertanyaan tambahan untuk tiket ini.
          </Body2>
        </Box>
      );
    }

    return (
      <Box display="flex" flexDirection="column" gap="16px">
        {additionalForms
          .filter((form: any) => !form.deletedAt)
          .map((form: any, index: number) => (
            <Box key={form.id} display="flex" flexDirection="column" gap="1">
              <Body2 color="text.secondary" fontSize="14px" fontWeight={600}>
                Question {index + 1}: {form.isRequired && '*'}
              </Body2>
              <Body2 color="text.primary" fontSize="14px">
                {form.field}
              </Body2>
            </Box>
          ))}
      </Box>
    );
  };

  return (
    <Modal 
      height={500} 
      open={open} 
      title={isGroupTicket(ticket) ? "Group Ticket Details" : "Ticket Details"} 
      onClose={onClose}
    >
      {ticket && (
        <Box display="flex" flexDirection="column" marginTop={isGroupTicket(ticket) ? 0 : "-12px"}>
          {/* Only show tabs for regular tickets, not group tickets */}
          {!isGroupTicket(ticket) && (
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              borderless={false}
              fullWidth={true}
            />
          )}
          
          <Box mt={isGroupTicket(ticket) ? 0 : 2}>
            {/* For group tickets, always show detail. For regular tickets, show based on active tab */}
            {(isGroupTicket(ticket) || activeTab === 'detail') && renderDetailTicket()}
            {!isGroupTicket(ticket) && activeTab === 'additional' && renderAdditionalQuestion()}
          </Box>
        </Box>
      )}
    </Modal>
  );
};
