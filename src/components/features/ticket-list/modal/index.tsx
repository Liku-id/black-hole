import { Box } from '@mui/material';
import { FC, useState } from 'react';

import { Body2, Modal, Tabs } from '@/components/common';
import { dateUtils } from '@/utils';

interface AttendeeData {
  no: number;
  id: string;
  ticketId: string;
  name: string;
  ticketType: string;
  phoneNumber: string;
  date: string;
  paymentMethod: string;
  redeemStatus: string;
  email?: string;
  eventDate?: string;
  transactionId?: string;
  transactionNumber?: string;
}

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  attendee: AttendeeData | null;
  selectedEventData?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  } | null;
}

export const TicketDetailModal: FC<TicketDetailModalProps> = ({
  open,
  onClose,
  attendee,
  selectedEventData
}) => {
  const [activeTab, setActiveTab] = useState('detail');

  const tabs = [
    { id: 'detail', title: 'Detail Ticket' },
    { id: 'additional', title: 'Additional Question' }
  ];

  const renderDetailTicket = () => (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">User Name:</Body2>
        <Body2 fontWeight={500}>{attendee?.name}</Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Ticket Type:</Body2>
        <Body2 fontWeight={500}>{attendee?.ticketType}</Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Phone Number:</Body2>
        <Body2 fontWeight={500}>{attendee?.phoneNumber}</Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Email:</Body2>
        <Body2 fontWeight={500}>{attendee?.email || '-'}</Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Event Date:</Body2>
        <Body2 fontWeight={500}>
          {selectedEventData?.startDate
            ? dateUtils.formatDateDDMMYYYY(selectedEventData.startDate)
            : 'Not available'}
        </Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Transaction Date:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.date ? dateUtils.formatDateDDMMYYYY(attendee.date) : '-'}
        </Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Transaction ID:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.transactionNumber || '-'}
        </Body2>
      </Box>
    </Box>
  );

  const renderAdditionalQuestion = () => (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Body2 color="text.secondary" fontWeight={600}>
          Question 1:
        </Body2>
        <Body2 color="text.primary">
          What is your dietary preference?
        </Body2>
        <Body2 color="text.secondary" fontWeight={600}>
          Answer:
        </Body2>
        <Body2 color="text.primary">
          Vegetarian
        </Body2>
      </Box>
    </Box>
  );

  return (
    <Modal 
      height={500} 
      open={open} 
      title="Detail Ticket" 
      onClose={onClose}
    >
      {attendee && (
        <Box display="flex" flexDirection="column" marginTop="-12px">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            borderless={false}
            fullWidth={true}
          />
          
          <Box mt={2}>
            {activeTab === 'detail' && renderDetailTicket()}
            {activeTab === 'additional' && renderAdditionalQuestion()}
          </Box>
        </Box>
      )}
    </Modal>
  );
};
