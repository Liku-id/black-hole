import {
  Box,
  IconButton,
  Table,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  Pagination,
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common';
import { Event } from '@/types/event';
import { dateUtils, formatUtils } from '@/utils';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
  isCompact?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const EventsTable: FC<EventsTableProps> = ({
  events,
  loading = false,
  isCompact = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}) => {
  const router = useRouter();

  const handleViewClick = (event: Event) => {
    router.push(`/events/${event.metaUrl}`);
    return;
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
            <TableCell sx={{ width: '3%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Name
              </Body2>
            </TableCell>
            {!isCompact && (
              <TableCell sx={{ width: '11%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Submitted Date
                </Body2>
              </TableCell>
            )}
            <TableCell sx={{ width: isCompact ? '16%' : '10%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Date
              </Body2>
            </TableCell>
            {!isCompact && (
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Start Selling Date
                </Body2>
              </TableCell>
            )}
            <TableCell sx={{ width: '9%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Sold
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Total Revenue
              </Body2>
            </TableCell>
            <TableCell align={'left'} sx={{ width: '9%' }}>
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
                  {index + 1 + currentPage * 10}.
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {event.name}
                </Body2>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {dateUtils.formatDateDDMMYYYY(event.createdAt)}
                  </Body2>
                </TableCell>
              )}
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {dateUtils.formatDateDDMMYYYY(event.startDate)} -{' '}
                  {dateUtils.formatDateDDMMYYYY(event.endDate)}
                </Body2>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {event.lowestPriceTicketType?.sales_start_date
                      ? dateUtils.formatDateDDMMYYYY(
                          event.lowestPriceTicketType.sales_start_date
                        )
                      : '-'}
                  </Body2>
                </TableCell>
              )}
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {event.soldTickets} Ticket
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="primary.main" fontSize="14px" fontWeight={700}>
                  {formatUtils.formatPrice(parseFloat(event.totalRevenue))}
                </Body2>
              </TableCell>
              <TableCell>
                <Box display="flex">
                  <Tooltip title="Detail" arrow>
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
                  </Tooltip>

                  <Tooltip title="Attandee" arrow>
                    <IconButton
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        cursor: 'pointer',
                        opacity: ['on_going', 'done'].includes(
                          event.eventStatus
                        )
                          ? 1
                          : 0.5
                      }}
                      onClick={() => router.push(`/tickets?event=${event.id}`)}
                      disabled={
                        !['on_going', 'done'].includes(event.eventStatus)
                      }
                    >
                      <Image
                        alt="tickets"
                        height={22}
                        src="/icon/voucher.svg"
                        width={22}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Transaction" arrow>
                    <IconButton
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        cursor: 'pointer',
                        opacity: ['on_going', 'done'].includes(
                          event.eventStatus
                        )
                          ? 1
                          : 0.5
                      }}
                      onClick={() =>
                        router.push(`/finance/event-transactions/${event.id}`)
                      }
                      disabled={
                        !['on_going', 'done'].includes(event.eventStatus)
                      }
                    >
                      <Image
                        alt="transactions"
                        height={22}
                        src="/icon/money.svg"
                        width={22}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>

      {/* Pagination */}
      <Pagination
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => onPageChange && onPageChange(page)}
        loading={loading}
      />
    </StyledTableContainer>
  );
};

export default EventsTable;
