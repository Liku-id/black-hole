import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Stack, Divider } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';

import { Body1, Body2, H1, H3, Button, QRCode } from '@/components/common';
import { ticketTemplate } from '@/components/features/ots/order/ticket/template/ticketTemplate';
import DashboardLayout from '@/layouts/dashboard';
import { dateUtils } from '@/utils';

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Fetch tickets for this transaction
  const fetchUrl = id ? `/api/transaction/${id}/tickets` : null;
  const { data: response, isLoading, error } = useSWR(fetchUrl);
  const data = response?.body || response; // Handle different response wrappers

  const handleBack = () => {
    router.push('/ots');
  };

  const handlePrint = async () => {
    if (!data || !data.tickets) return;

    setIsPrinting(true);
    setPrintError(null);

    try {
      // Prepare ticket data for the template
      const ticketData = data.tickets.map((ticket: any, idx: number) => ({
        eventName: data.event?.name || '',
        eventOrganizerName: data.event?.eventOrganizer?.name || '',
        type: data.group_ticket?.name || data.ticketType?.name || '',
        attendee: ticket.visitor_name || `Attendee #${idx + 1}`,
        qrValue: ticket.id,
        date: dateUtils.formatDateTimeWIB(data.ticketType?.ticketStartDate || data.transaction?.createdAt),
        address: data.event?.address || '',
      }));

      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < ticketData.length; i++) {
        if (i > 0) pdf.addPage();

        // Render template for single ticket
        const html = ticketTemplate([ticketData[i]]);

        // Use iframe for rendering to avoid polluting current DOM
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '605px';
        iframe.style.height = '400px';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(html);
        doc.close();

        // Wait for potential images/fonts to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const canvas = await html2canvas(doc.body, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 605,
          height: 400
        });

        document.body.removeChild(iframe);

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // 170mm width on A4
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      }

      const fileName = `tickets-${data.event?.name?.replace(/\s+/g, '_') || 'event'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setPrintError('Failed to generate PDF. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box p="40px" textAlign="center">
          <Body2 color="text.secondary">Loading tickets...</Body2>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !data || !data.tickets) {
    return (
      <DashboardLayout>
        <Box p="40px" textAlign="center">
          <Body2 color="error.main">Failed to load tickets or no tickets found.</Body2>
          <Button variant="primary" onClick={handleBack} sx={{ mt: 2 }}>
            Back to OTS Menu
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const tickets = data.tickets || [];
  const eventName = data.event?.name || '';
  const organizerName = data.event?.eventOrganizer?.name || '';
  const ticketTypeName = data.group_ticket?.name || data.ticketType?.name || '';
  const eventDate = dateUtils.formatDateFullIndo(data.ticketType?.ticketStartDate || data.transaction?.createdAt);
  const eventAddress = data.event?.address || '';
  const mapUrl = data.event?.mapLocationUrl;

  return (
    <DashboardLayout>
      <Head>
        <title>Attendee Tickets | Likuid</title>
      </Head>

      <Box p="24px 40px">
        {/* Back Button */}
        <Box
          display="flex"
          alignItems="center"
          mb="12px"
          sx={{ cursor: 'pointer' }}
          onClick={handleBack}
        >
          <ArrowBackIcon sx={{ fontSize: '16px', color: 'text.secondary', mr: '12px' }} />
          <Body2 color="text.secondary">Back To OTS Menu</Body2>
        </Box>

        <Box display="flex" justifyContent="center" mb="60px">
          <Box width="653px">
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="24px">
              <H1 fontWeight={700} sx={{ fontSize: '30px' }}>
                Attendee ticket
              </H1>
              <Button
                variant="primary"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? 'Printing...' : 'Print Ticket'}
              </Button>
            </Box>

            {printError && (
              <Box mb={2}>
                <Body2 color="error.main">{printError}</Body2>
              </Box>
            )}

            {/* Main Card */}
            <Box bgcolor="background.paper" p="16px 24px">
              <H3 fontWeight={700} mb="24px" textAlign="center">
                {organizerName} | {eventName}
              </H3>

              {/* Tickets Container */}
              <Box
                border="1px solid"
                borderColor="text.secondary"
                p="14px"
              >
                {tickets.map((ticket: any, idx: number) => (
                  <React.Fragment key={ticket.id}>
                    {/* Ticket Header */}
                    <Box
                      pl={1}
                      mb={2}
                      display="flex"
                      alignItems="center"
                      height="42px"
                      sx={{
                        borderLeft: '2px solid',
                        borderLeftColor: 'success.main'
                      }}
                    >
                      <Body1 fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                        {ticketTypeName} #{idx + 1}
                      </Body1>
                    </Box>

                    {/* Dashed Divider */}
                    <Box
                      width="100%"
                      borderTop="1.5px dashed"
                      borderColor="divider"
                      mb={2}
                    />

                    {/* Ticket Content */}
                    <Box display="flex" gap={3} mb={2}>
                      {/* QR Code */}
                      <Box flex={1.5} display="flex" justifyContent="center">
                        <QRCode value={ticket.id} size={150} />
                      </Box>

                      {/* Info */}
                      <Box flex={3}>
                        <H3 fontWeight={700} mb={2} sx={{ textTransform: 'uppercase' }}>
                          {ticket.visitor_name || `Attendee #${idx + 1}`}
                        </H3>

                        <Stack gap={1.5}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Image
                              src="/icon/calendar-v5.svg"
                              alt="Date"
                              width={24}
                              height={24}
                            />
                            <Body2>{eventDate}</Body2>
                          </Box>

                          <Box display="flex" alignItems="start" gap={1.5}>
                            <Image
                              src="/icon/location-v2.svg"
                              alt="Location"
                              width={24}
                              height={24}
                            />
                            <Body2 sx={{ lineHeight: 1.4 }}>{eventAddress}</Body2>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Divider between tickets */}
                    {idx < tickets.length - 1 && (
                      <Divider sx={{ my: 3, borderColor: 'divider', borderWidth: '0.25px' }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>

              {/* Map Button */}
              {mapUrl && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(mapUrl, '_blank')}
                    sx={{
                      height: '32px',
                      borderColor: 'text.primary',
                      color: 'text.primary',
                      border: '0.5px solid'
                    }}
                  >
                    See Location
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
