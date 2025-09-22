import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { Event } from '@/types/event';
import { dateUtils } from '@/utils';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
}

const EventsTable: FC<EventsTableProps> = ({ events, loading = false }) => {
  const router = useRouter();

  const handleViewClick = (event: Event) => {
    const status = ((event as any).eventStatus || (event as any).status || '')
      .toString()
      .toLowerCase();
    const meta = event.metaUrl;

    if (status && status !== 'draft') {
      router.push(`/events/${meta}`);
      return;
    }

    if (status === 'draft') {
      const hasLowest = !!event.lowestPriceTicketType;
      if (!hasLowest) {
        router.push(`/events/create/${meta}/ticket`);
        return;
      }
      router.push(`/events/create/${meta}/assets`);
      return;
    }
  };

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
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Submitted Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '16%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Start Selling Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Sold
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Total Revenue
              </Body2>
            </TableCell>
            <TableCell align="right" sx={{ width: '5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Action
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {events.map((event, index) => (
            <TableRow key={event.id}>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {index + 1}.
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {event.name}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {dateUtils.formatDateDDMMYYYY(event.createdAt)}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {dateUtils.formatDateDDMMYYYY(event.startDate)} -{' '}
                  {dateUtils.formatDateDDMMYYYY(event.endDate)}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {event.lowestPriceTicketType?.sales_start_date
                    ? dateUtils.formatDateDDMMYYYY(
                        event.lowestPriceTicketType.sales_start_date
                      )
                    : '-'}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {event.lowestPriceTicketType?.purchased_amount || 0} Ticket
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="primary.main" fontSize="14px" fontWeight={700}>
                  {'-'}
                </Body2>
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', cursor: 'pointer' }}
                  onClick={() => handleViewClick(event)}
                >
                  <Image
                    alt="View"
                    height={24}
                    src="/icon/eye.svg"
                    width={24}
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
