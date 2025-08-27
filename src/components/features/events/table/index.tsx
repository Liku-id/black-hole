import { Event } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';
import Image from 'next/image';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled
} from '@mui/material';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { Body2 } from '@/components/common';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
}

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#FFFFFF',
  borderRadius: 0,
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    tableLayout: 'fixed',
    width: '100%'
  }
});

const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-head': {
    border: 'none',
    backgroundColor: 'transparent'
  },
  '& .MuiTableCell-root': {
    padding: "16px 0px"
  }
});

const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    borderTop: '1px solid #E2E8F0',
    '&:hover': {
      backgroundColor: '#F8FAFC'
    }
  },
  '& .MuiTableCell-body': {
    border: 'none',
    borderTop: '1px solid #E2E8F0'
  },
  '& .MuiTableCell-root': {
    padding: "16px 0px"
  }
});



const EventsTable: FC<EventsTableProps> = ({
  events,
  loading = false
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading events...</Body2>
      </Box>
    );
  }

  return (
    <StyledTableContainer>
      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>
              <Body2 fontSize="14px" color="text.secondary">No.</Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 fontSize="14px" color="text.secondary">Event Name</Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 fontSize="14px" color="text.secondary">Submitted Date</Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 fontSize="14px" color="text.secondary">Event Date</Body2>
            </TableCell>
            <TableCell sx={{ width: '16%' }}>
              <Body2 fontSize="14px" color="text.secondary">Start Selling Date</Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 fontSize="14px" color="text.secondary">Ticket Sold</Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 fontSize="14px" color="text.secondary">Total Revenue</Body2>
            </TableCell>
            <TableCell align="right" sx={{ width: '5%' }}>
              <Body2 fontSize="14px" color="text.secondary">Action</Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {events.map((event, index) => (
            <TableRow key={event.id}>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  {index + 1}.
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  {event.name}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  {dateUtils.formatDateDDMMYYYY(event.createdAt)}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  -
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  {event.lowestPriceTicketType?.sales_start_date ? dateUtils.formatDateDDMMYYYY(event.lowestPriceTicketType.sales_start_date) : '-'}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="text.primary">
                  {event.lowestPriceTicketType?.purchased_amount || 0} Ticket
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 fontSize="14px" color="primary.main" fontWeight={700}>
                  {event.lowestPriceTicketType?.price && event.lowestPriceTicketType?.purchased_amount
                    ? formatPrice(event.lowestPriceTicketType.price * event.lowestPriceTicketType.purchased_amount)
                    : '-'}
                </Body2>
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => router.push(`/events/${event.metaUrl}`)}
                  size="small"
                  sx={{ color: 'text.secondary', cursor: 'pointer' }}
                >
                  <Image
                    src="/icon/eye.svg"
                    alt="View"
                    width={24}
                    height={24}
                  />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default EventsTable;
