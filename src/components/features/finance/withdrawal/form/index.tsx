import { Box, Grid, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Body2, Button, Caption, Select, TextField } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { withdrawalService, WithdrawalSummary } from '@/services/withdrawal';
import { isEventOrganizer } from '@/types/auth';
import { EventDetail } from '@/types/event';
import { formatUtils } from '@/utils';

import { WithdrawalModal } from '../modal';

interface WithdrawalFormProps {
  eventId: string;
  eventDetail: EventDetail | null;
  summary: WithdrawalSummary | null;
  summaryLoading: boolean;
}

interface WithdrawalFormData {
  withdrawalName: string;
  withdrawalAmount: string;
  bankAccount: string;
  accountHolderName: string;
  accountNumber: string;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  eventId,
  eventDetail,
  summary,
  summaryLoading
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showInfo } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // Get bank information from user data
  const bankInfo =
    user && isEventOrganizer(user) ? user.bank_information : null;

  const methods = useForm<WithdrawalFormData>({
    defaultValues: {
      withdrawalName: bankInfo?.accountHolderName || '',
      withdrawalAmount: '',
      bankAccount: bankInfo
        ? `${bankInfo.bank.name} - ${bankInfo.accountNumber}`
        : '',
      accountHolderName: bankInfo?.accountHolderName || '',
      accountNumber: bankInfo?.accountNumber || ''
    }
  });

  const { watch, formState } = methods;
  const withdrawalAmount = watch('withdrawalAmount');
  const { isValid } = formState;

  const calculateFees = () => {
    const amount = parseFloat(withdrawalAmount) || 0;

    // Calculate platform fee (percentage based)
    const platformFee = eventDetail?.tax ? (amount * eventDetail.tax) / 100 : 0;

    // Calculate admin fee (can be percentage or fixed amount)
    let adminFee = 0;
    if (eventDetail?.adminFee) {
      if (eventDetail.adminFee < 100) {
        // Percentage
        adminFee = (amount * eventDetail.adminFee) / 100;
      } else {
        // Fixed amount
        adminFee = eventDetail.adminFee;
      }
    }

    // Withdrawal fee (usually fixed or percentage)
    const withdrawalFee = 0; // This should be calculated based on business rules

    // Total fees
    const totalFees = platformFee + adminFee + withdrawalFee;

    // Amount received by user (withdrawal amount minus fees)
    const amountReceived = amount - totalFees;

    return {
      platformFee,
      adminFee,
      withdrawalFee,
      totalFees,
      amountReceived,
      grandTotal: amount
    };
  };

  const fees = calculateFees();

  const handleWithdrawalClick = async () => {
    setWithdrawalError(null);
    const isValid = await methods.trigger();
    if (isValid) {
      setModalOpen(true);
    }
  };

  const handleWithdrawalConfirm = async () => {
    const formData = methods.getValues();

    setWithdrawalLoading(true);
    setWithdrawalError(null);

    try {
      // Validate withdrawal amount
      const requestedAmount = parseFloat(formData.withdrawalAmount);
      const availableAmount = summary ? parseFloat(summary.availableAmount) : 0;

      if (requestedAmount > availableAmount) {
        throw new Error('Withdrawal amount cannot exceed available amount');
      }

      if (requestedAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      const response = await withdrawalService.createWithdrawal({
        eventId,
        requestedAmount: formData.withdrawalAmount,
        bankId: bankInfo?.bankId || '',
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName
      });

      if (response.statusCode !== 0 && response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to process withdrawal');
      }

      showInfo('Withdrawal request submitted successfully!');
      setModalOpen(false);
      router.push('/finance');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setWithdrawalError(
        error instanceof Error ? error.message : 'Failed to process withdrawal'
      );
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setWithdrawalError(null);
  };

  return (
    <FormProvider {...methods}>
      <Grid container spacing={3}>
        {/* Left Grid - Form (8/12) */}
        <Grid item md={8} xs={12}>
          <Box bgcolor="background.paper" borderRadius={1} padding="24px">
            <TextField
              disabled
              fullWidth
              label="Withdrawal Name*"
              name="withdrawalName"
              placeholder="Withdrawal reason for"
              rules={{ required: 'Withdrawal name is required' }}
            />

            <Box mb={3} mt={4}>
              <Body2 color="text.primary" fontSize="16px" fontWeight={600}>
                Withdrawal Amount
              </Body2>
            </Box>

            <Box mb={2}>
              <Caption
                borderBottom={`1px solid ${theme.palette.grey[200]}`}
                paddingBottom={2}
              >
                Total Revenue
                <Box component="span" sx={{ float: 'right' }}>
                  {summary
                    ? formatUtils.formatPrice(parseFloat(summary.totalAmount))
                    : '-'}
                </Box>
              </Caption>
            </Box>

            <Box mb={2}>
              <Caption
                borderBottom={`1px solid ${theme.palette.grey[200]}`}
                paddingBottom={2}
              >
                Balance on Hold
                <Box component="span" sx={{ float: 'right' }}>
                  {summary
                    ? formatUtils.formatPrice(
                        parseFloat(summary.pendingSettlementAmount)
                      )
                    : '-'}
                </Box>
              </Caption>
            </Box>

            <Box mb={4}>
              <Caption
                borderBottom={`1px solid ${theme.palette.grey[200]}`}
                paddingBottom={2}
              >
                Available for Withdrawal
                <Box component="span" sx={{ float: 'right' }}>
                  {summary
                    ? formatUtils.formatPrice(
                        parseFloat(summary.availableAmount)
                      )
                    : '-'}
                </Box>
              </Caption>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={5}>
                <Box display="flex" justifyContent="flex-end" mt={1.5}>
                  <Body2 color="text.primary" fontSize="16px" fontWeight={600}>
                    Withdrawal Amount
                  </Body2>
                </Box>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  fullWidth
                  name="withdrawalAmount"
                  placeholder="Add Withdrawal Amount here"
                  rules={{
                    required: 'Withdrawal amount is required',
                    validate: {
                      positive: (value: string) => {
                        const amount = parseFloat(value);
                        return amount > 0 || 'Amount must be greater than 0';
                      },
                      notExceedAvailable: (value: string) => {
                        const amount = parseFloat(value);
                        const available = summary
                          ? parseFloat(summary.availableAmount)
                          : 0;
                        return (
                          amount <= available ||
                          `Amount cannot exceed available balance of ${formatUtils.formatPrice(available)}`
                        );
                      },
                      isNumber: (value: string) => {
                        const amount = parseFloat(value);
                        return !isNaN(amount) || 'Please enter a valid number';
                      }
                    }
                  }}
                  startComponent={<Box marginRight={1}>Rp</Box>}
                />

                <Box
                  borderBottom={`1px solid ${theme.palette.grey[200]}`}
                  mt={4}
                  paddingBottom={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Caption color="text.primary" fontWeight={700}>
                        Wukong Platform Fee
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="error.main">
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.platformFee)
                          : '-'}
                      </Caption>
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  borderBottom={`1px solid ${theme.palette.grey[200]}`}
                  mt={2}
                  paddingBottom={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Caption color="text.primary" fontWeight={700}>
                        Buyer Admin Fee
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="error.main">
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.adminFee)
                          : '-'}
                      </Caption>
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  borderBottom={`1px solid ${theme.palette.grey[200]}`}
                  mt={2}
                  paddingBottom={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Caption color="text.primary" fontWeight={700}>
                        Withdrawal Fee
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="error.main">
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.withdrawalFee)
                          : '-'}
                      </Caption>
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  borderBottom={`1px solid ${theme.palette.grey[200]}`}
                  mt={2}
                  paddingBottom={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Caption color="text.primary" fontWeight={700}>
                        Total Fees
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="error.main" fontWeight={600}>
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.totalFees)
                          : '-'}
                      </Caption>
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  borderBottom={`1px solid ${theme.palette.grey[200]}`}
                  mt={2}
                  paddingBottom={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Caption color="text.primary" fontWeight={700}>
                        Amount You'll Receive
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="success.main" fontWeight={600}>
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.amountReceived)
                          : '-'}
                      </Caption>
                    </Grid>
                  </Grid>
                </Box>

                <Box mb={4} mt={1}>
                  <Caption color="text.secondary">
                    * Estimated withdrawal acceptance time is 2-3 working days
                  </Caption>
                  <Caption color="text.secondary">
                    ** You can only make a withdrawal once a day
                  </Caption>
                </Box>

                <Box textAlign="right">
                  <Button
                    disabled={!withdrawalAmount || summaryLoading || !isValid}
                    onClick={handleWithdrawalClick}
                  >
                    Withdraw
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Grid - Summary (4/12) */}
        <Grid item md={4} xs={12}>
          <Box bgcolor="background.paper" borderRadius={1} padding="24px">
            <Body2 color="text.primary" fontSize="16px" fontWeight={600} mb={5}>
              Bank Account
            </Body2>

            <Select
              disabled
              fullWidth
              label="Bank Account"
              name="bankAccount"
              options={
                bankInfo
                  ? [
                      {
                        value: `${bankInfo.bank.name} - ${bankInfo.accountNumber}`,
                        label: `${bankInfo.bank.name} - ${bankInfo.accountNumber}`
                      }
                    ]
                  : []
              }
              placeholder={
                bankInfo
                  ? `${bankInfo.bank.name} - ${bankInfo.accountNumber}`
                  : 'No bank information available'
              }
              rules={{ required: 'Bank account is required' }}
            />
          </Box>
        </Grid>
      </Grid>

      <WithdrawalModal
        error={withdrawalError}
        loading={withdrawalLoading}
        open={modalOpen}
        onClose={handleModalClose}
        onConfirm={handleWithdrawalConfirm}
      />
    </FormProvider>
  );
};
