import { Box, Grid, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Body2, Caption, TextField } from '@/components/common';
import { withdrawalService } from '@/services';
import { WithdrawalSummary } from '@/services/withdrawal';
import { formatUtils } from '@/utils';

interface WithdrawalFormProps {
  eventId: string;
}

interface WithdrawalFormData {
  withdrawalName: string;
  withdrawalAmount: string;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ eventId }) => {
  const theme = useTheme();
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const methods = useForm<WithdrawalFormData>({
    defaultValues: {
      withdrawalName: '',
      withdrawalAmount: ''
    }
  });

  const { watch } = methods;
  const withdrawalAmount = watch('withdrawalAmount');

  // Fetch withdrawal summary
  const fetchSummary = async () => {
    if (!eventId) return;

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const response = await withdrawalService.getSummaryByEventId(eventId);
      setSummary(response.body);
    } catch (err) {
      setSummaryError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch withdrawal summary'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [eventId]);

  // Calculate fees and totals
  const calculateFees = () => {
    const amount = parseFloat(withdrawalAmount) || 0;
    const platformFee = amount * 0.05; // 5% platform fee
    const adminFee = amount * 0.02; // 2% admin fee
    const withdrawalFee = 5000; // Fixed withdrawal fee
    const grandTotal = amount + platformFee + adminFee + withdrawalFee;

    return {
      platformFee,
      adminFee,
      withdrawalFee,
      grandTotal
    };
  };

  const fees = calculateFees();

  // const handleSubmit = (data: WithdrawalFormData) => {
  //   console.log(data);
  // };

  return (
    <FormProvider {...methods}>
      <Grid container spacing={3}>
        {/* Left Grid - Form (8/12) */}
        <Grid item md={8} xs={12}>
          <Box bgcolor="background.paper" borderRadius={1} padding="24px">
            <TextField
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
                color="text.secondary"
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
                color="text.secondary"
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
                color="text.secondary"
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
                      <Caption color="text.primary">Buyer Admin Fee</Caption>
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
                      <Caption color="text.primary">Withdrawal Fee</Caption>
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
                      <Caption color="text.primary" fontWeight={600}>
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

                <Box mt={1}>
                  <Caption color="text.secondary">
                    * Estimated withdrawal acceptance time is 2-3 working days
                  </Caption>
                  <Caption color="text.secondary">
                    ** You can only make a withdrawal once a day
                  </Caption>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Grid - Summary (4/12) */}
        <Grid item md={4} xs={12}>
          <Box bgcolor="background.paper" borderRadius={1} padding="24px">
            <Body2 color="text.primary" fontSize="16px" fontWeight={600} mb={2}>
              Withdrawal Summary
            </Body2>

            {summaryLoading ? (
              <Caption color="text.secondary">Loading...</Caption>
            ) : summaryError ? (
              <Caption color="error.main">{summaryError}</Caption>
            ) : summary ? (
              <Box>
                <Box mb={2}>
                  <Caption color="text.secondary">Available Amount</Caption>
                  <Body2 color="text.primary" fontSize="16px" fontWeight={600}>
                    {formatUtils.formatPrice(
                      parseFloat(summary.availableAmount)
                    )}
                  </Body2>
                </Box>

                <Box mb={2}>
                  <Caption color="text.secondary">Total Revenue</Caption>
                  <Body2 color="text.primary" fontSize="16px">
                    {formatUtils.formatPrice(parseFloat(summary.totalAmount))}
                  </Body2>
                </Box>

                <Box>
                  <Caption color="text.secondary">Balance on Hold</Caption>
                  <Body2 color="text.primary" fontSize="16px">
                    {formatUtils.formatPrice(
                      parseFloat(summary.pendingSettlementAmount)
                    )}
                  </Body2>
                </Box>
              </Box>
            ) : (
              <Caption color="text.secondary">No data available</Caption>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Submit Button */}
      {/* <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="primary"
          onClick={methods.handleSubmit(handleSubmit)}
          disabled={!withdrawalAmount || summaryLoading}
        >
          Submit Withdrawal
        </Button>
      </Box> */}
    </FormProvider>
  );
};
