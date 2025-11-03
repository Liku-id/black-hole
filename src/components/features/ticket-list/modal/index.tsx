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
  redeemedAt?: string;
  checkedInAt?: string;
  attendeeData?: Array<{
    field: string;
    value: string[];
  }>;
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
        <Body2 color="text.secondary">Payment Method:</Body2>
        <Body2 fontWeight={500}>{attendee?.paymentMethod || '-'}</Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Transaction ID:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.transactionNumber || '-'}
        </Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Transaction Date:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.date ? dateUtils.formatDateDDMMYYYYHHMM(attendee.date) : '-'}
        </Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Redeemed At:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.redeemedAt ? dateUtils.formatDateDDMMYYYYHHMM(attendee.redeemedAt) : '-'}
        </Body2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Checked In At:</Body2>
        <Body2 fontWeight={500}>
          {attendee?.checkedInAt ? dateUtils.formatDateDDMMYYYYHHMM(attendee.checkedInAt) : '-'}
        </Body2>
      </Box>
    </Box>
  );

  const renderAdditionalQuestion = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      {(attendee?.attendeeData && attendee.attendeeData.length > 0) ? (
        attendee.attendeeData.map((item, idx) => (
          <Box key={`${item.field}-${idx}`} display="flex" flexDirection="column" gap={0.5}>
            <Body2 color="text.secondary" fontWeight={600}>
              {`Question ${idx + 1}:`}
            </Body2>
            <Body2 color="text.primary">{item.field}</Body2>
            <Body2 color="text.primary">{(item.value || []).join(', ') || '-'}</Body2>
          </Box>
        ))
      ) : (
        <Body2 color="text.secondary">No additional answers</Body2>
      )}
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
