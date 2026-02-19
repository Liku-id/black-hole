import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableCell,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import {
  Button,
  H2,
  H3,
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
  Pagination
} from '@/components/common';
import { StyledTextField } from '@/components/common/text-field/StyledTextField';
import { useToast } from '@/contexts/ToastContext';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { ticketTemplate } from '@/lib/ticketTemplate';
import { eventsService } from '@/services/events';
import type { Invitation } from '@/types/event';
import { dateUtils } from '@/utils/dateUtils';

interface InvitationFilters {
  page: number;
  limit: number;
  search?: string;
  ticket_type_id?: string;
  status?: string;
}

function InvitationPage() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail, loading: eventLoading } = useEventDetail(
    metaUrl as string
  );
  const { showError, showSuccess } = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState<InvitationFilters>({
    page: 0,
    limit: 10
  });

  const fetchInvitations = async () => {
    if (!eventDetail?.id) return;

    setLoading(true);
    try {
      const response = await eventsService.getInvitations(
        eventDetail.id,
        filters
      );
      setInvitations(response.body.data);
      setPagination(response.body.pagination);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      showError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventDetail?.id) {
      fetchInvitations();
    }
  }, [eventDetail?.id, filters]);

  const handleResend = async (id: string) => {
    try {
      setResendingId(id);
      await eventsService.resendInvitation(id);
      showSuccess('Invitation resent successfully');
    } catch (error) {
      console.error('Error resending invitation:', error);
      showError('Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      const data = await eventsService.getTicketInvitationsById(id);

      if (!data.body.tickets || data.body.tickets.length === 0) {
        showError('No tickets found for this invitation');
        return;
      }

      const tickets = (data.body.tickets || []).map((ticket: any) => ({
        eventName: data.body.event?.name,
        eventOrganizerName: data.body.event?.eventOrganizer?.name,
        type: data.body.ticketType?.name,
        attendee: ticket.visitor_name,
        qrValue: ticket.id,
        date: dateUtils.formatDate(
          data.body.ticketType?.ticketStartDate,
          'datetime'
        ),
        address: data.body.event?.address,
        mapLocation: data.body.event?.mapLocationUrl,
        raw: ticket
      }));

      // Generate PDF with proper page breaks
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Process each ticket individually
      for (let i = 0; i < tickets.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // Generate HTML for single ticket
        const singleTicketHtml = ticketTemplate([tickets[i]]);

        // Create temporary iframe for this ticket
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '605px';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '-9999';
        document.body.appendChild(iframe);

        // Write HTML to iframe
        iframe.contentDocument!.write(singleTicketHtml);
        iframe.contentDocument!.close();

        // Wait for fonts and content to load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Capture this ticket
        const canvas = await html2canvas(iframe.contentDocument!.body, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 605,
          height: 600,
          onclone: (clonedDoc) => {
            const clonedBody = clonedDoc.body;
            if (clonedBody) {
              clonedBody.style.backgroundColor = '#ffffff';
            }
          }
        });

        // Clean up iframe
        document.body.removeChild(iframe);

        // Add ticket to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      }

      // Generate filename using recipient name and date
      const recipientName = data.body.name?.replace(/\s+/g, '_') || 'recipient';
      const eventDate = dateUtils.getTodayWIBString();
      const fileName = `${recipientName}-${eventDate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      showError('Failed to download ticket');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: pageSize,
      page: 0 // Reset to first page
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 0 // Reset to first page
    }));
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Invitation - Black Hole Dashboard</title>
      </Head>

      {/* Downloading PDF Loading Overlay - No Backdrop */}
      {downloadingId !== null && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: (theme) => theme.zIndex.modal + 1,
            backgroundColor: 'common.white',
            borderRadius: 2,
            boxShadow: 24,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            minWidth: 200
          }}
        >
          <CircularProgress size={50} sx={{ color: 'primary.main' }} />
          <Body2
            sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 500 }}
          >
            Generating PDF...
          </Body2>
        </Box>
      )}

      {/* Resending Loading Overlay - No Backdrop */}
      {resendingId !== null && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: (theme) => theme.zIndex.modal + 1,
            backgroundColor: 'common.white',
            borderRadius: 2,
            boxShadow: 24,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            minWidth: 200
          }}
        >
          <CircularProgress size={50} sx={{ color: 'primary.main' }} />
          <Body2
            sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 500 }}
          >
            Resending invitation...
          </Body2>
        </Box>
      )}

      <Box>
        {/* Back Button */}
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          sx={{ cursor: 'pointer', width: 'fit-content' }}
          onClick={() => router.push('/events')}
        >
          <ArrowBackIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
          <Body2 color="text.secondary">Back To Event List</Body2>
        </Box>

        {/* Title */}
        <Box mb={3}>
          <H2 color="text.primary" fontWeight={700}>
            Event Name: {eventLoading ? 'Loading...' : eventDetail?.name}
          </H2>
        </Box>

        {/* Action Button */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            onClick={() => {
              router.push(`/events/${metaUrl}/invitation/create`);
            }}
          >
            Add New Recipient
          </Button>
        </Box>

        {/* Invitation List */}
        <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
          <CardContent sx={{ padding: '24px' }}>
            <Box
              mb={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <H3 fontWeight={700}>Invitation List</H3>
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
                placeholder="Search by name or email"
                sx={{
                  width: '300px',
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    backgroundColor: 'common.white'
                  }
                }}
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </Box>

            <StyledTableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ width: '60px' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        No
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '20%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        Full Name
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        No Telp
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '30%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        Email
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        Ticket Type
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '10%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        Qty
                      </Body2>
                    </TableCell>
                    <TableCell sx={{ width: '10%' }}>
                      <Body2 color="text.secondary" fontWeight={600}>
                        Action
                      </Body2>
                    </TableCell>
                  </TableRow>
                </StyledTableHead>
                <StyledTableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ textAlign: 'center', py: 5, border: 'none' }}
                      >
                        <Body2 color="text.secondary">Loading...</Body2>
                      </TableCell>
                    </TableRow>
                  ) : invitations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ textAlign: 'center', py: 5, border: 'none' }}
                      >
                        <Body2 color="text.secondary">
                          No invitations available
                        </Body2>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation, index) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <Body2 color="text.primary">
                            {pagination.page * pagination.limit + index + 1}
                          </Body2>
                        </TableCell>
                        <TableCell>
                          <Body2 color="text.primary">{invitation.name}</Body2>
                        </TableCell>
                        <TableCell>
                          <Body2 color="text.primary">
                            {invitation.phone_number}
                          </Body2>
                        </TableCell>
                        <TableCell>
                          <Body2 color="text.primary">{invitation.email}</Body2>
                        </TableCell>
                        <TableCell>
                          <Body2 color="text.primary">
                            {invitation.ticket_type_name}
                          </Body2>
                        </TableCell>
                        <TableCell>
                          <Body2 color="text.primary">
                            {invitation.ticket_qty}
                          </Body2>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Download Invitation">
                              <IconButton
                                onClick={() => handleDownload(invitation.id)}
                              >
                                <Image
                                  src="/icon/download.svg"
                                  alt="download"
                                  width={20}
                                  height={20}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Resend Invitation">
                              <IconButton
                                onClick={() => handleResend(invitation.id)}
                              >
                                <Image
                                  src="/icon/share.svg"
                                  alt="resend"
                                  width={20}
                                  height={20}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </StyledTableBody>
              </Table>

              {/* Pagination */}
              <Pagination
                total={pagination.totalRecords}
                currentPage={pagination.page}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={loading}
              />
            </StyledTableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(InvitationPage, { requireAuth: true });
