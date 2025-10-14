import { Box, Grid, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Body2,
  Button,
  Caption,
  Overline,
  Select,
  TextField
} from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { withdrawalService, WithdrawalSummary } from '@/services/withdrawal';
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
  const { showInfo } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // Get bank information from user data
  // const bankInfo =
  // user && isEventOrganizer(user) ? user.bank_information : null;

  const methods = useForm<WithdrawalFormData>({
    defaultValues: {
      withdrawalName: '',
      withdrawalAmount: '',
      bankAccount: summary
        ? `${summary.bankName} - ${summary.accountNumber}`
        : '',
      accountHolderName: summary?.accountHolderName || '',
      accountNumber: summary?.accountNumber || ''
    }
  });

  // Update form values when summary data changes
  useEffect(() => {
    if (summary) {
      methods.setValue(
        'bankAccount',
        `${summary.bankName} - ${summary.accountNumber}`
      );
      methods.setValue('accountHolderName', summary.accountHolderName || '');
      methods.setValue('accountNumber', summary.accountNumber || '');
    }
  }, [summary, methods]);

  const { watch, formState } = methods;
  const withdrawalAmount = watch('withdrawalAmount');
  const { isValid } = formState;

  const calculateFees = () => {
    const amount = parseFloat(withdrawalAmount) || 0;
    const platformFee = parseFloat(
      eventDetail?.feeThresholds?.[0]?.platformFee || '0'
    );
    const withdrawalFee = parseFloat(eventDetail?.withdrawalFee || '0');
    const totalFees = platformFee + withdrawalFee;
    const totalForBackend = amount;
    const grandTotal = amount - totalFees;

    return {
      platformFee,
      withdrawalFee,
      totalFees,
      totalForBackend,
      grandTotal
    };
  };

  const fees = calculateFees();

  const isTotalForBackendExceeded =
    summary && withdrawalAmount
      ? fees.totalForBackend > parseFloat(summary.availableAmount)
      : false;
  const isGrandTotalMinus = withdrawalAmount && fees.grandTotal <= 0;

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
      const response = await withdrawalService.createWithdrawal({
        eventId,
        requestedAmount: fees.totalForBackend.toString(), // Total withdrawal amount + semua fee
        bankId: summary?.bankId || '',
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        withdrawalName: formData.withdrawalName
      });

      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to process withdrawal');
      }

      showInfo('Withdrawal Success!');
      router.push('/finance');
    } catch (error) {
      setWithdrawalError(
        error instanceof Error ? error.message : 'Failed to process withdrawal'
      );
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
              id="withdrawal_name_field"
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
                  id="withdrawal_amount_field"
                  fullWidth
                  name="withdrawalAmount"
                  placeholder="Add Withdrawal Amount here"
                  rules={{
                    required: 'Withdrawal amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' }
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
                        Grand Total
                      </Caption>
                    </Grid>
                    <Grid item xs={6}>
                      <Caption color="success.main" fontWeight={600}>
                        {withdrawalAmount
                          ? formatUtils.formatPrice(fees.grandTotal)
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
                  {isTotalForBackendExceeded && (
                    <Box mb={1}>
                      <Overline color="error.main" fontWeight={600}>
                        Total amount (including fees) exceeds available balance
                      </Overline>
                    </Box>
                  )}
                  {isGrandTotalMinus && (
                    <Box mb={1}>
                      <Overline color="error.main" fontWeight={600}>
                        Grand total cannot be zero or negative
                      </Overline>
                    </Box>
                  )}
                  <Button
                    id="withdrawal_button"
                    disabled={
                      !withdrawalAmount ||
                      summaryLoading ||
                      !isValid ||
                      isTotalForBackendExceeded ||
                      isGrandTotalMinus
                    }
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
            <Body2 color="text.primary" fontSize="16px" fontWeight={600} mb={2}>
              Bank Account
            </Body2>

            <Box mb={2}>
              <TextField
                fullWidth
                name="accountHolderName"
                label="Account Holder"
                placeholder="Account Holder"
                type="text"
                disabled
                rules={{ required: 'Bank account holder is required' }}
              />
            </Box>

            <Select
              disabled
              fullWidth
              label="Bank Account"
              name="bankAccount"
              options={
                summary
                  ? [
                      {
                        value: `${summary.bankName} - ${summary.accountNumber}`,
                        label: `${summary.bankName} - ${summary.accountNumber}`
                      }
                    ]
                  : []
              }
              placeholder={
                summary
                  ? `${summary.bankName} - ${summary.accountNumber}`
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
