import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Stack, Divider } from '@mui/material';
import html2canvas from 'html2canvas';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toDataURL } from 'qrcode';
import { useState, useEffect, useRef } from 'react';

import { Body2, Body1, Caption, H1, H2, H3, Button, QRCode } from '@/components/common';
import { useTransaction } from '@/hooks/features/transactions/useTransaction';
import DashboardLayout from '@/layouts/dashboard';
import { formatPrice } from '@/utils';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { id } = router.query;

  // Use hook with polling enabled
  const { transaction, loading, mutate } = useTransaction(id as string, true);

  const cardRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState<string>('00:00');

  // Handle Redirect on status change
  useEffect(() => {
    if (transaction?.status) {
      const status = transaction.status.toLowerCase();
      if (status === 'paid') {
        router.push(`/ots/payment-success/${id}`);
      } else if (status === 'failed' || status === 'expired') {
        router.push(`/ots/payment-success/${id}`);
      }
    }
  }, [transaction?.status, id, router]);

  // Timer logic
  useEffect(() => {
    if (!transaction?.expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(transaction.expiresAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft('00:00');
        // Optionally handle expiration
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const timerId = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timerId);
  }, [transaction?.expiresAt]);

  const handleBack = () => {
    router.push('/ots');
  };

  const handleDownloadQR = async () => {
    if (!qrString) return;
    try {
      const dataUrl = await toDataURL(qrString, { width: 1024, margin: 2 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR_${transaction?.transactionNumber || 'transaction'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR:', err);
    }
  };

  const handleScreenshot = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F1F5F9', // Use background color
        scale: 2 // Higher quality
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Confirmation_${transaction?.transactionNumber || 'transaction'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to take screenshot:', err);
    }
  };

  if (loading && !transaction) {
    return (
      <DashboardLayout>
        <Box p="40px" textAlign="center">
          <Body2 color="text.secondary">Loading transaction details...</Body2>
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

  const qrString = transaction.paymentDetails?.qris?.qrString || '';
  const totalPrice = transaction.paymentBreakdown?.totalPrice || 0;

  return (
    <DashboardLayout>
      <Head>
        <title>Payment Confirmation | Likuid</title>
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
        <H2 color="text.primary" mb="36px" fontWeight={700}>
          Payment Confirmation
        </H2>

        {/* Banner Text */}
        <H3
          textAlign="center"
          color="text.primary"
          mb="16px"
          fontWeight={400}
        >
          One more step to have fun
        </H3>

        {/* Confirmation Card */}
        <Box display="flex" justifyContent="center">
          <Box
            ref={cardRef}
            width="653px"
            bgcolor="background.paper"
            p="16px 24px"
            sx={{
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Transaction Info Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb="40px">
              <Box>
                <Body2 color="text.primary">
                  Transaction Number: <Box component="span" fontWeight={700}>{transaction.transactionNumber}</Box>
                </Body2>
                <Caption color="text.secondary" mt="8px" display="block">
                  Complete your booking in
                </Caption>
              </Box>
              <Body1 fontWeight={700} color="error.main">
                {timeLeft}
              </Body1>
            </Box>

            {/* QR Code Section */}
            <Box display="flex" justifyContent="center" mb="32px">
              <QRCode value={qrString} size={200} />
            </Box>

            {/* Price section */}
            <Box textAlign="center" mb="24px">
              <H1 color="text.primary" mb="8px" fontWeight={700}>
                {formatPrice(totalPrice)}
              </H1>
              <Caption color="text.secondary" display="block">
                Xendit Payment gateway
              </Caption>
            </Box>

            {/* Bottom Border */}
            <Divider sx={{ borderColor: 'text.secondary', opacity: 0.1 }} />

            {/* Action Links */}
            <Stack direction="row" justifyContent="center" gap="32px" mt="24px">
              <Caption
                color="primary.main"
                sx={{ cursor: 'pointer' }}
                onClick={handleDownloadQR}
              >
                Download QR code
              </Caption>
              <Caption
                color="primary.main"
                sx={{ cursor: 'pointer' }}
                onClick={handleScreenshot}
              >
                Screenshot
              </Caption>
            </Stack>

            {/* Manual Confirmation Button */}
            <Box display="flex" justifyContent="center" mt="16px">
              <Button
                variant="primary"
                onClick={() => mutate()}
              >
                Confirm Payment
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>

  );
}
