import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Collapse, Stack, Radio } from '@mui/material';
import { useState, useEffect } from 'react';

import { Body1, Body2, Button, Caption, H1 } from '@/components/common';
import { usePaymentMethods } from '@/hooks/list/usePaymentMethods';
import { TicketType, EventDetail } from '@/types/event';
import { formatPrice } from '@/utils';

interface OrderItem {
  ticketType: TicketType;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  eventDetail?: EventDetail;
  onCheckout: () => void;
  loading?: boolean;
  showPaymentSelection?: boolean;
  selectedPaymentId?: string;
  onPaymentMethodChange?: (id: string, fee: number) => void;
}

const DashedDivider = () => (
  <Box my="16px" width="100%" height="1px" sx={{ borderBottom: '2px dashed', borderColor: 'grey.300' }} />
);

export function OrderSummary({
  items,
  eventDetail,
  onCheckout,
  loading,
  showPaymentSelection = false,
  selectedPaymentId,
  onPaymentMethodChange
}: OrderSummaryProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();

  // Find QRIS among available payment methods
  const allMethods = Object.values(paymentMethods).flat();
  const qrisMethod = allMethods.find((m) => m.paymentCode === 'QRIS');

  // Trigger onPaymentMethodChange when QRIS is loaded
  useEffect(() => {
    if (showPaymentSelection && qrisMethod && onPaymentMethodChange && !selectedPaymentId) {
      onPaymentMethodChange(qrisMethod.id, qrisMethod.paymentMethodFee);
    }
  }, [qrisMethod, showPaymentSelection, selectedPaymentId, onPaymentMethodChange]);

  const selectedItems = items.filter((item) => item.quantity > 0);
  const totalQty = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = selectedItems.reduce(
    (acc, item) => acc + item.ticketType.price * item.quantity,
    0
  );

  // Admin Fee logic: percentage if <= 100, fixed if > 100
  const adminFeeRate = eventDetail?.adminFee || 0;
  const adminFee = totalQty === 0 || totalPrice === 0
    ? 0
    : adminFeeRate <= 100
      ? Math.round((totalPrice * adminFeeRate) / 100)
      : Math.round(adminFeeRate);
  const pb1Rate = (eventDetail?.tax || 0) / 100;
  const tax = Math.round(totalPrice * pb1Rate);

  // Payment Method Fee logic - only show if selection is enabled
  const paymentMethodFee = (showPaymentSelection && qrisMethod)
    ? qrisMethod.paymentMethodFee < 1
      ? Math.round((totalPrice * qrisMethod.paymentMethodFee) / 100)
      : qrisMethod.paymentMethodFee
    : 0;

  const grandTotal = totalPrice + adminFee + tax + paymentMethodFee;

  return (
    <Box
      bgcolor="common.white"
      p="24px"
      position="sticky"
      top="24px"
    >
      <Body1 fontWeight={600} mb="24px">Order details</Body1>

      <Box mb="16px">
        <Caption color="text.secondary">
          Total Payment: <Box component="span" fontWeight={700} color="text.primary">{totalQty} Ticket</Box>
        </Caption>
        <H1 fontWeight={700} color="text.primary">
          {formatPrice(grandTotal)}
        </H1>
      </Box>

      <DashedDivider />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setShowDetail(!showDetail)}
      >
        {showDetail ? (
          <KeyboardArrowUpIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
        ) : (
          <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
        )}
        <Caption color="primary.main" sx={{ textDecoration: 'underline' }}>
          {showDetail ? 'Hide Detail' : 'See Detail'}
        </Caption>
      </Box>

      <Collapse in={showDetail}>
        <Box mt="24px">
          <Body2 fontWeight={600} mb="4px">Price Detail</Body2>
          <Stack spacing="4px">
            <Box display="flex" justifyContent="space-between">
              <Caption color="text.secondary">Ticket Price</Caption>
              <Caption fontWeight={600}>{formatPrice(totalPrice)}</Caption>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Caption color="text.secondary">Payment Method Fee</Caption>
              <Caption fontWeight={600}>{formatPrice(paymentMethodFee)}</Caption>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Caption color="text.secondary">Admin Fee</Caption>
              <Caption fontWeight={600}>{formatPrice(adminFee)}</Caption>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Caption color="text.secondary">PB1</Caption>
              <Caption fontWeight={600}>{formatPrice(tax)}</Caption>
            </Box>
          </Stack>
        </Box>
      </Collapse>

      <DashedDivider />

      {showPaymentSelection && qrisMethod && (
        <Box mt="8px" mb="24px">
          <Body2 fontWeight={600} mb="24px">Payment Method</Body2>
          <Box display="flex" alignItems="center">
            <Radio
              checked={selectedPaymentId === qrisMethod.id || !!qrisMethod}
              onChange={() => onPaymentMethodChange?.(qrisMethod.id, qrisMethod.paymentMethodFee)}
              sx={{
                p: 0,
                mr: '16px',
                color: 'primary.main',
                '&.Mui-checked': { color: 'primary.main' }
              }}
            />
            <Box
              component="img"
              src={qrisMethod.logo}
              alt="QRIS"
              sx={{ width: '50px', height: '25px', objectFit: 'contain', mr: '12px' }}
            />
            <Body2 color="text.primary" fontWeight={500}>QRIS</Body2>
          </Box>
          <Box
            mt="16px"
            width="100%"
            height="0.5px"
            bgcolor="text.secondary"
            sx={{ opacity: 0.5 }}
          />
        </Box>
      )}

      <Box display="flex" justifyContent="center">
        <Button
          disabled={
            selectedItems.length === 0 ||
            loading ||
            (showPaymentSelection && (paymentMethodsLoading || !qrisMethod))
          }
          onClick={onCheckout}
          sx={{ py: '12px' }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}

