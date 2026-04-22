import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Stack, Divider } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Body1, Body2, Caption, H2, H3, Button } from '@/components/common';
import { useTransaction } from '@/hooks/features/transactions/useTransaction';
import DashboardLayout from '@/layouts/dashboard';
import { dateUtils, formatUtils } from '@/utils';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { id } = router.query;

  const { transaction, loading } = useTransaction(id as string);

  const handleBack = () => {
    router.push('/ots');
  };

  const handleViewTickets = () => {
    // Navigate to ticket detail page for this transaction
    router.push(`/ots/ticket/${id}`);
  };

  const totalsData = useMemo(() => {
    if (!transaction) return null;

    const groupTicket = transaction.group_ticket;
    const ticketType = transaction.ticketType ?? { price: 0, quantity: 0 };
    const price = groupTicket ? groupTicket.price : ticketType.price;
    const orderQuantity = transaction.orderQuantity || 0;

    const subtotal = price * orderQuantity;
    const discount = 0;

    const adminFee = subtotal === 0
      ? 0
      : (transaction.event?.adminFee ?? 0) <= 100
        ? Math.round(subtotal * ((transaction.event?.adminFee ?? 0) / 100))
        : Math.round(transaction.event?.adminFee ?? 0);
    const pb1 = Math.round(subtotal * ((transaction.event?.tax || 0) / 100));
    // Handle payment method fee
    const paymentMethodFee =
      transaction.paymentMethod?.paymentMethodFee < 1
        ? Math.round(
          (subtotal * transaction.paymentMethod.paymentMethodFee) / 100
        )
        : transaction.paymentMethod?.paymentMethodFee || 0;

    const totalPayment = subtotal + adminFee + pb1 + paymentMethodFee;

    return {
      subtotal,
      adminFee,
      pb1,
      paymentMethodFee,
      totalPayment,
      discount
    };
  }, [transaction]);

  if (loading && !transaction) {
    return (
      <DashboardLayout>
        <Box p="40px" textAlign="center">
          <Body2 color="text.secondary">Loading transaction status...</Body2>
        </Box>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <Box p="40px" textAlign="center">
          <Body2 color="error.main">Transaction not found</Body2>
        </Box>
      </DashboardLayout>
    );
  }

  const isSuccess = transaction.status?.toLowerCase() === 'paid';
  const statusLabel = isSuccess ? 'Success' : 'Failed';
  const statusIcon = isSuccess ? '/icon/success-status.svg' : '/icon/failed-status.svg';
  const statusMessage = isSuccess
    ? "Congratulations 🎉\nYou’re all set for the event!"
    : "Your transaction is failed";

  const eoName = transaction.event?.eventOrganizer?.name || '';
  const eventName = transaction.event?.name || '';
  const transactionNumber = transaction.transactionNumber || '-';
  const transactionDate = transaction.createdAt
    ? dateUtils.formatDateFullIndo(transaction.createdAt)
    : '-';
  const paymentMethodName = transaction.paymentMethod?.name || '-';

  return (
    <DashboardLayout>
      <Head>
        <title>Transaction {statusLabel} | Likuid</title>
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

        {/* Title */}
        <H2 color="text.primary" mb="44px" fontWeight={700}>
          Transaction {statusLabel}
        </H2>

        {/* Status Card */}
        <Box display="flex" justifyContent="center">
          <Box
            width="382px"
            bgcolor="background.paper"
            p="16px 24px"
            sx={{
              borderRadius: '4px',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            {/* Status Icon */}
            <Box mb="16px" display="flex" justifyContent="center">
              <Image
                src={statusIcon}
                alt={statusLabel}
                width={64}
                height={64}
              />
            </Box>

            {/* Message */}
            <H3
              color="text.primary"
              mb="24px"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {statusMessage}
            </H3>

            {/* Event & EO Info */}
            <Box textAlign="left" mb="4px">
              <Body1 color="text.primary" fontWeight={600}>
                {eoName} | {eventName}
              </Body1>
            </Box>

            {/* Transaction Number */}
            <Box textAlign="left" mb="24px">
              <Caption color="text.primary" fontWeight={300}>
                Transaction Number:{' '}
                <Box component="span" fontWeight={700}>
                  {transactionNumber}
                </Box>
              </Caption>
            </Box>

            {/* Transaction Details Section */}
            <Box textAlign="left">
              <Body2 fontWeight={600} mb="16px" color="text.primary">
                Transaction Details
              </Body2>

              <Stack gap="8px">
                <Box display="flex" justifyContent="space-between">
                  <Body2 color="text.secondary">Transaction Date</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {transactionDate}
                  </Body2>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Body2 color="text.secondary">Transaction Number</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {transactionNumber}
                  </Body2>
                </Box>
                <Box display="flex" justifyContent="space-between" mb="16px">
                  <Body2 color="text.secondary">Payment Method</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {paymentMethodName}
                  </Body2>
                </Box>
              </Stack>

              <Divider sx={{ mb: '16px', borderColor: '#585C71', borderWidth: '0.25px' }} />

              <Stack gap="8px">
                <Box display="flex" justifyContent="space-between">
                  <Body2 color="text.secondary">Subtotal</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {formatUtils.formatPrice(totalsData?.subtotal || 0)}
                  </Body2>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Body2 color="text.secondary">Payment Method Fee</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {formatUtils.formatPrice(totalsData?.paymentMethodFee || 0)}
                  </Body2>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Body2 color="text.secondary">Admin Fee</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {formatUtils.formatPrice(totalsData?.adminFee || 0)}
                  </Body2>
                </Box>
                <Box display="flex" justifyContent="space-between" mb="16px">
                  <Body2 color="text.secondary">Tax</Body2>
                  <Body2 fontWeight={700} color="text.primary">
                    {formatUtils.formatPrice(totalsData?.pb1 || 0)}
                  </Body2>
                </Box>
              </Stack>

              <Divider sx={{ mb: '16px', borderColor: '#585C71', borderWidth: '0.25px' }} />

              <Box display="flex" justifyContent="space-between" mb="24px">
                <Body2 fontWeight={700} color="text.primary">Total Payment</Body2>
                <Body2 fontWeight={700} color="text.primary">
                  {formatUtils.formatPrice(totalsData?.totalPayment || 0)}
                </Body2>
              </Box>

              <Box display="flex" justifyContent="center">
                {isSuccess ? (
                  <Button variant="primary" onClick={handleViewTickets}>
                    View Ticket
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleBack}>
                    Back to OTS Menu
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
