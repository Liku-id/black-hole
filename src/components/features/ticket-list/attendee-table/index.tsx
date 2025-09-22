import {
  Box,
  Button,
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
  TableRow,
  Typography
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Card, TextField } from '@/components/common';
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common/table';
import { useToast } from '@/contexts/ToastContext';
import { ticketsService } from '@/services';
import { TicketStatus } from '@/types/ticket';

interface AttendeeData {
  no: number;
  id: string; // Database ID for API calls
  ticketId: string;
  name: string;
  ticketType: string;
  phoneNumber: string;
  date: string;
  paymentMethod: string;
  redeemStatus: TicketStatus;
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
  onPageChange
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

  const { showSuccess, showError } = useToast();

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

      showSuccess('Ticket redeemed successfully!');

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

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Attendee Details Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Attendee Details
            </Typography>

            <TextField
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
              placeholder="Name/Ticket ID"
              sx={{
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  fontSize: '14px',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                },
                '& .MuiInputBase-input': {
                  py: 0
                }
              }}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
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
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '60px'
                    }}
                  >
                    No
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '120px'
                    }}
                  >
                    Ticket ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '180px'
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '120px'
                    }}
                  >
                    Ticket Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '150px'
                    }}
                  >
                    Phone Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '100px'
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '140px'
                    }}
                  >
                    Payment Method
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '120px'
                    }}
                  >
                    Redeem Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: '80px'
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </StyledTableHead>
              <StyledTableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2
                        }}
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
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: '14px' }}
                        >
                          Loading tickets...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : attendeeData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: '14px' }}
                      >
                        No tickets found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendeeData.map((attendee) => (
                    <TableRow key={attendee.ticketId}>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.no}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.ticketId}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.ticketType}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.phoneNumber}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.date}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '14px', color: 'text.primary' }}
                      >
                        {attendee.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            backgroundColor: `${getStatusDisplay(attendee.redeemStatus).color}20`,
                            color: getStatusDisplay(attendee.redeemStatus).color
                          }}
                        >
                          {getStatusDisplay(attendee.redeemStatus).text}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          sx={{ p: 1 }}
                          onClick={(e) =>
                            handleActionClick(e, attendee.ticketId)
                          }
                        >
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: '1px solid #E2E8F0'
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
              Showing {total === 0 ? 0 : currentPage * pageSize + 1} to{' '}
              {Math.min((currentPage + 1) * pageSize, total)} of {total} entries
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <IconButton
                disabled={currentPage === 0}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '12px',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: '#F8FAFC'
                  },
                  '&:disabled': {
                    color: '#CBD5E1'
                  }
                }}
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
              >
                ‹
              </IconButton>

              {/* Simple pagination - show current page and total pages */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                {currentPage + 1}
              </Box>

              {Math.ceil(total / pageSize) > 1 && (
                <Typography
                  sx={{ fontSize: '12px', color: 'text.secondary', mx: 0.5 }}
                >
                  of {Math.ceil(total / pageSize)}
                </Typography>
              )}

              <IconButton
                disabled={currentPage >= Math.ceil(total / pageSize) - 1}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '12px',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: '#F8FAFC'
                  },
                  '&:disabled': {
                    color: '#CBD5E1'
                  }
                }}
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
              >
                ›
              </IconButton>
            </Box>
          </Box>
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
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          <Typography
            sx={{
              fontSize: '14px',
              color: 'text.primary',
              textAlign: 'left',
              mb: 3
            }}
          >
            Are you sure you want to redeem this ticket?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end'
            }}
          >
            <Button
              sx={{
                minWidth: '80px',
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
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
                minWidth: '80px',
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  User Name:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  {selectedAttendee.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Ticket Type:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  {selectedAttendee.ticketType}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Phone Number:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  {selectedAttendee.phoneNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Email:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  edgar.alamsjah@example.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Event Date:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  25/12/2026
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Transaction Date:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  {selectedAttendee.date}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                  Transaction ID:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  1234567890
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}
              >
                <Button
                  sx={{
                    minWidth: '80px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
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
