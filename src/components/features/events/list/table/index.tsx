import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

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
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    eventId: string
  ) => {
    setAnchorEl((prev) => ({ ...prev, [eventId]: event.currentTarget }));
  };

  const handleMenuClose = (eventId: string) => {
    setAnchorEl((prev) => ({ ...prev, [eventId]: null }));
  };

  const handleViewClick = (event: Event) => {
    router.push(`/events/${event.metaUrl}`);
    handleMenuClose(event.id);
  };

  const handleAttendeeClick = (event: Event) => {
    router.push(`/tickets?event=${event.id}`);
    handleMenuClose(event.id);
  };

  const handleTransactionClick = (event: Event) => {
    router.push(`/finance/event-transactions/${event.id}`);
    handleMenuClose(event.id);
  };

  const handlePartnerTicketClick = (event: Event) => {
    router.push(`/events/${event.metaUrl}/partner-ticket`);
    handleMenuClose(event.id);
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
                <Box>
                  <IconButton
                    size="small"
                    id="hamburger_icon_button"
                    sx={{ color: 'text.secondary', cursor: 'pointer' }}
                    onClick={(e) => handleMenuOpen(e, event.id)}
                  >
                    <Image
                      alt="Options"
                      height={24}
                      src="/icon/options.svg"
                      width={24}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl[event.id]}
                    open={Boolean(anchorEl[event.id])}
                    onClose={() => handleMenuClose(event.id)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          backgroundColor: 'common.white',
                          boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
                          borderRadius: 1,
                          minWidth: 200,
                          mt: 1
                        }
                      }
                    }}
                  >
                    <MenuItem
                      onClick={() => handleViewClick(event)}
                      sx={{
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                        <Image
                          alt="Event Detail"
                          src="/icon/eye.svg"
                          height={18}
                          width={18}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Body2
                            color="text.primary"
                            fontSize="14px"
                            fontWeight="400"
                          >
                            Event Detail
                          </Body2>
                        }
                      />
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleAttendeeClick(event)}
                      disabled={
                        !['on_going', 'done'].includes(event.eventStatus)
                      }
                      sx={{
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        },
                        '&.Mui-disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                        <Image
                          alt="Attendee Tickets"
                          src="/icon/voucher.svg"
                          height={18}
                          width={18}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Body2
                            color="text.primary"
                            fontSize="14px"
                            fontWeight="400"
                          >
                            Attendee Tickets
                          </Body2>
                        }
                      />
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleTransactionClick(event)}
                      disabled={
                        !['on_going', 'done'].includes(event.eventStatus)
                      }
                      sx={{
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        },
                        '&.Mui-disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                        <Image
                          alt="Event Transaction"
                          src="/icon/money.svg"
                          height={18}
                          width={18}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Body2
                            color="text.primary"
                            fontSize="14px"
                            fontWeight="400"
                          >
                            Event Transaction
                          </Body2>
                        }
                      />
                    </MenuItem>
                    {['on_going', 'approved', 'done'].includes(
                      event.eventStatus
                    ) && (
                      <MenuItem
                        id="partner_ticket"
                        onClick={() => handlePartnerTicketClick(event)}
                        sx={{
                          padding: '12px 16px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                          <Image
                            alt="Partner Ticket"
                            src="/icon/partner-ticket.svg"
                            height={18}
                            width={18}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Body2
                              color="text.primary"
                              fontSize="14px"
                              fontWeight="400"
                            >
                              Partner Ticket
                            </Body2>
                          }
                        />
                      </MenuItem>
                    )}
                  </Menu>
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
