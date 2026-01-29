import { Info } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

import {
  Body1,
  Body2,
  Pagination,
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { eventsService } from '@/services/events';
import { UserRole, isEventOrganizer, User } from '@/types/auth';
import { Event } from '@/types/event';
import { dateUtils, formatUtils } from '@/utils';

import { DeleteEventModal } from './modal/delete';
import { DuplicateEventModal } from './modal/duplicate';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
  isCompact?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  showAction?: boolean;
}

const EventsTable: FC<EventsTableProps> = ({
  events,
  loading = false,
  isCompact = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange,
  showAction = true,
  onRefresh
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();
  const userRole =
    user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;

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

  const handleDuplicateClick = (event: Event) => {
    setSelectedEvent(event);
    setDuplicateModalOpen(true);
    setDuplicateError(null);
    setDuplicateSuccess(false);
    handleMenuClose(event.id);
  };

  const handleDuplicateConfirm = async () => {
    if (!selectedEvent) return;

    try {
      setDuplicateLoading(true);
      setDuplicateError(null);
      await eventsService.duplicateEvent(selectedEvent.id);
      setDuplicateSuccess(true);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Failed to duplicate event:', error);
      let errorMessage = 'Failed to duplicate event. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setDuplicateError(errorMessage);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleDuplicateModalClose = () => {
    setDuplicateModalOpen(false);
    setSelectedEvent(null);
    setDuplicateSuccess(false);
    setDuplicateError(null);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    handleMenuClose(event.id);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await eventsService.deleteEvent(selectedEvent.id);
      setDeleteSuccess(true);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      let errorMessage = 'Failed to delete event. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setDeleteError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedEvent(null);
    setDeleteSuccess(false);
    setDeleteError(null);
  };

  const getUpdateRequestStatusIcon = (status?: string) => {
    if (!status || !['draft', 'pending', 'rejected'].includes(status)) {
      return null;
    }

    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'draft':
          return {
            iconColor: 'grey.600',
            tooltip: 'Continue your update process',
            tooltipBg: 'grey.800',
            tooltipText: 'common.white'
          };
        case 'pending':
          return {
            iconColor: 'warning.main',
            tooltip: 'Your update request is currently under review',
            tooltipBg: 'warning.dark',
            tooltipText: 'common.white'
          };
        case 'rejected':
          return {
            iconColor: 'error.main',
            tooltip:
              'Your update has been rejected. Please review and make necessary corrections',
            tooltipBg: 'error.dark',
            tooltipText: 'common.white'
          };
        default:
          return null;
      }
    };

    const config = getStatusConfig(status);
    if (!config) return null;

    return (
      <Tooltip
        title={config.tooltip}
        arrow
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: config.tooltipBg,
              color: config.tooltipText,
              fontSize: '12px',
              padding: '8px 12px'
            }
          },
          arrow: {
            sx: {
              color: config.tooltipBg
            }
          }
        }}
      >
        <Box component="span" display="inline-flex" alignItems="center">
          <Info
            fontSize="small"
            sx={{
              color: config.iconColor,
              fontSize: '14px'
            }}
          />
        </Box>
      </Tooltip>
    );
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
            <TableCell sx={{ width: '24%' }}>
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
            {showAction && (
              <TableCell align={'left'} sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            )}
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showAction ? 8 : 7} sx={{ border: 'none' }}>
                <Box py={4} textAlign="center">
                  <Body1 gutterBottom color="text.secondary">
                    No events found
                  </Body1>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            events.map((event, index) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {index + 1 + currentPage * 10}.
                  </Body2>
                </TableCell>
                <TableCell>
                  <Tooltip title={event.name} arrow>
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      {event.name}
                    </Body2>
                  </Tooltip>
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
                    <Box position="relative" maxWidth="34px">
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

                      <Box position="absolute" top={0} right={-5}>
                        {userRole !== UserRole.GROUND_STAFF &&
                          userRole !== UserRole.FINANCE &&
                          getUpdateRequestStatusIcon(
                            event.eventUpdateRequestStatus
                          )}
                      </Box>
                    </Box>
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
                      {userRole !== UserRole.FINANCE && (
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
                      )}
                      {userRole !== UserRole.GROUND_STAFF && (
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
                      )}
                      {userRole !== UserRole.GROUND_STAFF &&
                        userRole !== UserRole.FINANCE &&
                        ['on_going', 'approved', 'done'].includes(
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
                      {userRole !== UserRole.GROUND_STAFF &&
                        userRole !== UserRole.FINANCE &&
                        ['on_going'].includes(
                        event.eventStatus
                        ) && (
                          <MenuItem
                            onClick={() =>
                              router.push(`/events/${event.metaUrl}/invitation`)
                            }
                            sx={{
                              padding: '12px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                              <Image
                                alt="Invitation"
                                src="/icon/invitation.svg"
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
                                  Invitation Ticket
                                </Body2>
                              }
                            />
                          </MenuItem>
                        )}
                      {userRole !== UserRole.GROUND_STAFF &&
                        userRole !== UserRole.FINANCE &&
                        event.eventStatus !== 'draft' && (
                          <MenuItem
                            onClick={() => handleDuplicateClick(event)}
                            sx={{
                              padding: '12px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                              <Image
                                alt="Duplicate Event"
                                src="/icon/copy.svg"
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
                                  Duplicate Event
                                </Body2>
                              }
                            />
                          </MenuItem>
                        )}
                      {userRole !== UserRole.GROUND_STAFF &&
                        userRole !== UserRole.FINANCE &&
                        (event.eventStatus === 'draft' ||
                          event.eventStatus === 'rejected') && (
                          <MenuItem
                            onClick={() => handleDeleteClick(event)}
                            sx={{
                              padding: '12px 16px',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                              <Image
                                alt="Delete Event"
                                src="/icon/trash.svg"
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
                                  Delete Event
                                </Body2>
                              }
                            />
                          </MenuItem>
                        )}
                    </Menu>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
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

      {/* Duplicate Event Modal */}
      <DuplicateEventModal
        open={duplicateModalOpen}
        onClose={handleDuplicateModalClose}
        onConfirm={handleDuplicateConfirm}
        loading={duplicateLoading}
        isSuccess={duplicateSuccess}
        error={duplicateError}
      />

      {/* Delete Event Modal */}
      <DeleteEventModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        isSuccess={deleteSuccess}
        error={deleteError}
        eventName={selectedEvent?.name || ''}
      />
    </StyledTableContainer >
  );
};

export default EventsTable;
