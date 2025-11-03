import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Pagination, Button as ButtonExport } from '@/components/common';
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common/table';
import { StyledTextField } from '@/components/common/text-field/StyledTextField';
import { Body1, Body2, Caption, H4 } from '@/components/common/typography';
import { useToast } from '@/contexts/ToastContext';
import { useExportTickets } from '@/hooks';
import { ticketsService } from '@/services';
import { TicketStatus } from '@/types/ticket';
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
  redeemStatus: TicketStatus;
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

interface AttendeeTableProps {
  attendeeData: AttendeeData[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRedeemTicket: (ticketId: string) => void;
  loading?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedEventData?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  } | null;
}

export const AttendeeTable = ({
  attendeeData,
  searchQuery,
  onSearchChange,
  onRedeemTicket,
  loading = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange,
  selectedEventData
  // onPageSizeChange // Not implemented in current design
}: AttendeeTableProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeData | null>(
    null
  );
  const [redeemLoading, setRedeemLoading] = useState(false);

  const { showInfo, showError } = useToast();
  const { exportTickets, loading: exportLoading } = useExportTickets();

  const handleActionClick = (
    event: React.MouseEvent<HTMLElement>,
    ticketId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedTicketId(null);
  };

  const handleRedeemTicket = () => {
    if (selectedTicketId) {
      const attendee = attendeeData.find(
        (a) => a.ticketId === selectedTicketId
      );
      if (attendee) {
        setSelectedAttendee(attendee);
        setRedeemModalOpen(true);
      }
    }
    handleActionClose();
  };

  const handleDetailTicket = () => {
    if (selectedTicketId) {
      const attendee = attendeeData.find(
        (a) => a.ticketId === selectedTicketId
      );
      if (attendee) {
        setSelectedAttendee(attendee);
        setDetailModalOpen(true);
      }
    }
    handleActionClose();
  };

  // Function to get status display text and color
  const getStatusDisplay = (status: TicketStatus) => {
    switch (status) {
      case 'issued':
        return { text: 'Unredeemed', color: '#E7031E' }; // Red
      case 'redeemed':
        return { text: 'Redeemed', color: '#38D200' }; // Green
      case 'pending':
      case 'cancelled':
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          color: '#6B7280'
        }; // Grey
      default:
        return { text: 'Unknown', color: '#6B7280' }; // Grey fallback
    }
  };

  const handleConfirmRedeem = async () => {
    if (!selectedAttendee) return;

    // Check if ticket is already redeemed
    if (selectedAttendee.redeemStatus === 'redeemed') {
      showError('This ticket has already been redeemed');
      return;
    }

    setRedeemLoading(true);
    try {
      await ticketsService.redeemTicket(selectedAttendee.id, {
        ticketStatus: 'redeemed'
      });

      showInfo('Ticket Redeemed');

      // Call the parent component's redeem handler to refresh data
      onRedeemTicket(selectedAttendee.id);

      // Close modal and reset state
      setRedeemModalOpen(false);
      setSelectedAttendee(null);
    } catch (error: any) {
      console.error('Error redeeming ticket:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to redeem ticket. Please try again.';
      showError(errorMessage);
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCloseModals = () => {
    setRedeemModalOpen(false);
    setDetailModalOpen(false);
    setSelectedAttendee(null);
  };

  const handleExportTickets = async () => {
    // Validate event is selected
    if (!selectedEventData?.id) {
      showError('Please select an event first');
      return;
    }

    try {
      await exportTickets(selectedEventData.id, selectedEventData.name);
      showInfo('Tickets exported successfully!');
    } catch (error: any) {
      showError(error?.message || 'Failed to export tickets');
    }
  };

  return (
    <>
      <Card sx={{ mt: 3, p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Attendee Details Header */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <H4
              sx={{
                color: 'text.primary'
              }}
            >
              Attendee Details
            </H4>

            <Box display="flex" alignItems="center" gap={2}>
              <StyledTextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image
                        alt="search"
                        height={16}
                        src="/icon/search.svg"
                        width={16}
                      />
                    </InputAdornment>
                  )
                }}
                placeholder="Name"
                sx={{
                  width: '250px',
                  '& .MuiOutlinedInput-root': {
                    height: '40px'
                  }
                }}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />

              <ButtonExport
                type="button"
                variant="primary"
                disabled={exportLoading || !selectedEventData?.id}
                startIcon={
                  exportLoading ? <CircularProgress size={16} /> : undefined
                }
                sx={{ padding: '11px 24px' }}
                onClick={handleExportTickets}
              >
                {exportLoading ? 'Exporting...' : 'Export'}
              </ButtonExport>
            </Box>
          </Box>

          {/* Attendee Table */}
          <StyledTableContainer
            sx={{ borderTop: '1px solid #E2E8F0', pt: 0.5 }}
          >
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="50px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      No
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="100px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Ticket ID
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="140px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Name
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="100px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Ticket Type
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="110px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Phone Number
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="140px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Transaction Date
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="100px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Redeem Status
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                    width="60px"
                  >
                    <Body2 color="text.secondary" fontWeight={600}>
                      Action
                    </Body2>
                  </TableCell>
                </TableRow>
              </StyledTableHead>
              <StyledTableBody>
                {loading ? (
                  <TableRow>
                    <TableCell align="center" colSpan={9} sx={{ py: 4 }}>
                      <Box
                        alignItems="center"
                        display="flex"
                        flexDirection="column"
                        gap={2}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            border: '2px solid #E2E8F0',
                            borderTop: '2px solid #3B82F6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                        <Body2 color="text.secondary">Loading tickets...</Body2>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : attendeeData.length === 0 ? (
                  <TableRow>
                    <TableCell align="center" colSpan={9} sx={{ py: 4 }}>
                      <Body2 color="text.secondary">No tickets found</Body2>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendeeData.map((attendee) => (
                    <TableRow key={attendee.ticketId}>
                      <TableCell>
                        <Body2>{attendee.no + currentPage * pageSize}.</Body2>
                      </TableCell>
                      <TableCell>
                        <Body2>{attendee.ticketId}</Body2>
                      </TableCell>
                      <TableCell>
                        <Body2>{attendee.name}</Body2>
                      </TableCell>
                      <TableCell>
                        <Body2>{attendee.ticketType}</Body2>
                      </TableCell>
                      <TableCell>
                        <Body2>{attendee.phoneNumber}</Body2>
                      </TableCell>
                      <TableCell>
                        <Body2>
                          {dateUtils.formatDateDDMMYYYYHHMM(attendee.date)}
                        </Body2>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: '10px',
                            backgroundColor: `${getStatusDisplay(attendee.redeemStatus).color}20`
                          }}
                        >
                          <Caption
                            color={
                              getStatusDisplay(attendee.redeemStatus).color
                            }
                            fontWeight={600}
                          >
                            {getStatusDisplay(attendee.redeemStatus).text}
                          </Caption>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          sx={{ p: 1 }}
                          onClick={(e) =>
                            handleActionClick(e, attendee.ticketId)
                          }
                        >
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: 'text.secondary'
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: 'text.secondary'
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: 'text.secondary'
                              }}
                            />
                          </Box>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </StyledTableBody>
            </Table>
          </StyledTableContainer>

          {/* Pagination */}
          <Pagination
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => onPageChange && onPageChange(page)}
            loading={loading}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        slotProps={{
          paper: {
            sx: {
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              border: '1px solid #E2E8F0',
              mt: 1,
              minWidth: '160px'
            }
          }
        }}
        onClose={handleActionClose}
      >
        {/* Only show Redeem option for tickets that can be redeemed */}
        {(() => {
          const currentAttendee = attendeeData.find(
            (a) => a.ticketId === selectedTicketId
          );
          return (
            currentAttendee?.redeemStatus === 'issued' && (
              <>
                <MenuItem
                  sx={{
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': {
                      backgroundColor: '#F8FAFC'
                    }
                  }}
                  onClick={handleRedeemTicket}
                >
                  <Image
                    alt="redeem"
                    height={16}
                    src="/icon/ticket.svg"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(27%) sepia(78%) saturate(2476%) hue-rotate(232deg) brightness(102%) contrast(92%)'
                    }}
                    width={16}
                  />
                  Redeem Ticket
                </MenuItem>
                <Divider sx={{ mx: 2 }} />
              </>
            )
          );
        })()}
        <MenuItem
          sx={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&:hover': {
              backgroundColor: '#F8FAFC'
            }
          }}
          onClick={handleDetailTicket}
        >
          <Image
            alt="detail"
            height={16}
            src="/icon/withdrawal.svg"
            width={16}
          />
          Detail Ticket
        </MenuItem>
      </Menu>

      {/* Redeem Ticket Modal */}
      <Dialog
        open={redeemModalOpen}
        PaperProps={{
          sx: {
            borderRadius: '4px',
            padding: 2,
            minWidth: '400px',
            maxWidth: '500px'
          }
        }}
        onClose={handleCloseModals}
      >
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          sx={{
            mb: 1.5
          }}
        >
          <DialogTitle
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'text.primary',
              p: 0,
              flex: 1
            }}
          >
            Redeem Ticket
          </DialogTitle>
          <IconButton sx={{ p: 0.5 }} onClick={handleCloseModals}>
            <Image alt="close" height={16} src="/icon/close.svg" width={16} />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 0, px: 0, pb: 1 }}>
          <Body1 sx={{ textAlign: 'left', mb: 4, mt: 2 }}>
            Are you sure you want to redeem this ticket?
          </Body1>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              sx={{
                minWidth: '81px',
                height: '46px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                backgroundColor: 'rgba(60, 80, 224, 0.1)',
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(60, 80, 224, 0.15)',
                  borderColor: 'primary.dark'
                }
              }}
              variant="outlined"
              onClick={handleCloseModals}
            >
              Back
            </Button>
            <Button
              disabled={redeemLoading}
              sx={{
                minWidth: '102px',
                height: '46px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '&:disabled': {
                  backgroundColor: '#94A3B8',
                  color: 'white'
                }
              }}
              onClick={handleConfirmRedeem}
            >
              {redeemLoading ? (
                <Box alignItems="center" display="flex" gap={1}>
                  <CircularProgress color="inherit" size={16} />
                  <span>Redeeming...</span>
                </Box>
              ) : (
                'Redeem'
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Detail Ticket Modal */}
      <Dialog
        open={detailModalOpen}
        PaperProps={{
          sx: {
            borderRadius: '4px',
            padding: 2,
            minWidth: '400px',
            maxWidth: '500px'
          }
        }}
        onClose={handleCloseModals}
      >
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          sx={{
            mb: 1.5
          }}
        >
          <DialogTitle
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'text.primary',
              p: 0,
              flex: 1
            }}
          >
            Detail Ticket
          </DialogTitle>
          <IconButton sx={{ p: 0.5 }} onClick={handleCloseModals}>
            <Image alt="close" height={16} src="/icon/close.svg" width={16} />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 0, px: 0, pb: 1 }}>
          {selectedAttendee && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Body2 color="text.secondary">User Name:</Body2>
                <Body2 fontWeight={500}>{selectedAttendee.name}</Body2>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Body2 color="text.secondary">Ticket Type:</Body2>
                <Body2 fontWeight={500}>{selectedAttendee.ticketType}</Body2>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Body2 color="text.secondary">Phone Number:</Body2>
                <Body2 fontWeight={500}>{selectedAttendee.phoneNumber}</Body2>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Body2 color="text.secondary">Email:</Body2>
                <Body2 fontWeight={500}>{selectedAttendee?.email || '-'}</Body2>
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
                  {dateUtils.formatDateDDMMYYYY(selectedAttendee.date)}
                </Body2>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Body2 color="text.secondary">Transaction ID:</Body2>
                <Body2 fontWeight={500}>
                  {selectedAttendee.transactionNumber || '-'}
                </Body2>
              </Box>
              <Box display="flex" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <Button
                  sx={{
                    minWidth: '80px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                  onClick={handleCloseModals}
                >
                  Back
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendeeTable;
