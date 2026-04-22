import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box } from '@mui/material';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { activeOtsOrderAtom, ActiveOtsOrder } from '@/atoms/otsOrderAtom';
import { Body1, Body2, H2, H3, Caption, TextField, PhoneField } from '@/components/common';
import { OrderSummary } from '@/components/features/ots/order/summary';
import { useToast } from '@/contexts/ToastContext';
import { ordersService } from '@/services/orders';
import { EventDetail } from '@/types/event';

interface OrderDetailStepProps {
  activeOrder: ActiveOtsOrder;
  onBack: () => void;
  eventDetail?: EventDetail;
  onSuccess?: (orderId: string) => void;
  eventName?: string;
}

export function OrderDetailStep({ activeOrder, onBack, eventDetail, onSuccess, eventName }: OrderDetailStepProps) {
  const router = useRouter();
  const setActiveOrder = useSetAtom(activeOtsOrderAtom);
  const { showInfo, showError } = useToast();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [isExpired, setIsExpired] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: ''
    }
  });

  const handlePaymentMethodChange = (id: string) => {
    setSelectedPaymentId(id);
  };

  const onSubmit = async (data: any) => {
    if (!selectedPaymentId) {
      showError('Please select a payment method');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        orderId: activeOrder.id,
        paymentMethodId: selectedPaymentId,
        attendee: [],
        contactDetails: {
          name: data.fullName,
          email: data.email,
          phone: data.phone
        }
      };

      const response = await ordersService.checkoutOrder(payload);

      if (response && (response.statusCode === 200 || response.statusCode === 0)) {
        showInfo('Checkout processed successfully!');
        
        const transactionId = response.transaction?.id;
        if (transactionId) {
          // Reset order state so user can start fresh on next OTS visit
          setActiveOrder(null);
          router.push(`/ots/checkout-payment/${transactionId}`);
        } else if (onSuccess) {
          onSuccess(activeOrder.id);
        } else {
          onBack();
        }
      } else {
        showError(response.message || 'Failed to process checkout');
      }
    } catch (error: any) {
      showError(error?.message || 'Failed to process checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Order Data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordersService.getOrder(activeOrder.id);
        setOrderData(response);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [activeOrder.id]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!activeOrder.expiredAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(activeOrder.expiredAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        onBack(); // Auto-redirect to ticket list when expired
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft(); // Initial call
    const timerId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [activeOrder.expiredAt]);

  // Transform tickets to match OrderSummary props expectations
  const summaryItems = orderData?.tickets?.map((t: any) => ({
    ticketType: { price: t.price } as any,
    quantity: t.count,
  })) || [];

  return (
    <Box>
      {/* Header Section - Full Width */}
      <Box mb="24px">
        {/* Back Button */}
        <Box
          display="flex"
          alignItems="center"
          mb="12px"
          sx={{ cursor: 'pointer' }}
          onClick={onBack}
        >
          <ArrowBackIcon sx={{ fontSize: '16px', color: 'primary.main', mr: '12px' }} />
          <Body2 color="text.secondary">Back To Ticket Selling</Body2>
        </Box>
      </Box>

      {/* Main Content - Grid 60/40 */}
      <Box display="flex" gap="24px" width="100%">
        {/* Left Column: 60% */}
        <Box sx={{ flex: '0 0 calc(60% - 12px)', width: 'calc(60% - 12px)' }}>
          {/* Title */}
          <H2 color="text.primary" mb="12px" fontWeight={700}>
            Detail Attendee & Payment Method
          </H2>

          {/* Event Name */}
          <H3 color="text.primary" mb="16px">
            {eventName || orderData?.event_name || 'Event Name'}
          </H3>

          {/* Divider */}
          <Box
            mb="16px"
            width="100%"
            height="1px"
            sx={{ borderBottom: '1px solid', borderColor: 'text.primary' }}
          />

          {/* Timer Row */}
          <Box display="flex" justifyContent="space-between" mb="24px">
            <Caption color="text.secondary">Complete your booking in</Caption>
            <Body1 color="error.main" fontWeight={600}>
              {isExpired ? 'Timeout' : timeLeft}
            </Body1>
          </Box>

          <Body1 fontWeight={600} mb="8px">
            Contact Details
          </Body1>

          <FormProvider {...methods}>
            <Box
              bgcolor="common.white"
              p="24px"
              mb="24px"
            >
              <TextField
                name="fullName"
                label="Full Name*"
                placeholder="Enter full name"
                rules={{ required: 'Full name is required' }}
                fullWidth
                sx={{ mb: '16px' }}
              />
              <TextField
                name="email"
                label="Email Address*"
                placeholder="Enter email address"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                fullWidth
                sx={{ mb: '16px' }}
              />
              <PhoneField
                name="phone"
                label="Phone Number*"
                rules={{ required: 'Phone number is required' }}
                fullWidth
                sx={{ mb: '24px' }}
              />

              <Caption color="text.secondary">
                <Box component="span" fontWeight={700}>
                  Notice:
                </Box>{' '}
                Make sure your data is correct. We will send the ticket to the e-mail that you declared.
              </Caption>
            </Box>
          </FormProvider>
        </Box>

        {/* Right Column: 40% */}
        <Box sx={{ flex: '0 0 calc(40% - 12px)', width: 'calc(40% - 12px)' }}>
          {loading ? (
            <Box
              bgcolor="common.white"
              p="24px"
              borderRadius="4px"
              border={1}
              borderColor="grey.100"
            >
              <Body2 color="text.secondary">Loading Order Details...</Body2>
            </Box>
          ) : (
            <Box mt="28px">
              <OrderSummary
                items={summaryItems}
                eventDetail={eventDetail}
                onCheckout={methods.handleSubmit(onSubmit)}
                loading={isSubmitting}
                showPaymentSelection={true}
                selectedPaymentId={selectedPaymentId}
                onPaymentMethodChange={handlePaymentMethodChange}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
