import { useForm, FormProvider } from 'react-hook-form';
import { Box, Grid } from '@mui/material';

import {
  TextField,
  Select,
  Button,
  H4,
  Overline,
  Body2
} from '@/components/common';
import { EventOrganizer } from '@/types/organizer';
import { useBanks } from '@/hooks/features/organizers/useBanks';

interface BankEditFormProps {
  eventOrganizer: EventOrganizer;
  onSubmit?: (data: any) => void;
  error?: string | null;
  loading?: boolean;
}

interface FormData {
  bank_id: string;
  account_number: string;
  account_holder_name: string;
}

export const BankEditForm = ({
  eventOrganizer,
  onSubmit,
  error,
  loading
}: BankEditFormProps) => {
  const { data: banksData, loading: bankLoad } = useBanks();

  const methods = useForm<FormData>({
    defaultValues: {
      bank_id: eventOrganizer.bank_information?.bankId || '',
      account_number: eventOrganizer.bank_information?.accountNumber || '',
      account_holder_name:
        eventOrganizer.bank_information?.accountHolderName || ''
    }
  });

  const { handleSubmit } = methods;

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Failed to submit bank form:', error);
    }
  };

  // Prepare bank options
  const bankOptions =
    banksData?.banks?.map((bank) => ({
      value: bank.id,
      label: bank.name
    })) || [];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <H4 fontWeight={600} marginBottom={2}>
          Bank Information
        </H4>

        <Grid container spacing={3}>
          {/* Left Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bank Account Number*"
                  name="account_number"
                  placeholder="Bank Account Number"
                  rules={{
                    required: 'Bank account number is required'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bank Account Holder Name*"
                  name="account_holder_name"
                  placeholder="Account Holder name"
                  rules={{
                    required: 'Account holder name is required'
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Grid */}
          <Grid item md={6} xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Bank Name*"
                  name="bank_id"
                  options={bankOptions}
                  placeholder={bankLoad ? 'please wait...' : 'Choose Bank'}
                  rules={{
                    required: 'Bank name is required'
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box marginTop={4} textAlign="right">
          {error && (
            <Box marginBottom={2}>
              <Overline color="error.main">{error}</Overline>
            </Box>
          )}

          <Box
            display="flex"
            gap={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Note */}
            <Body2 color="text.secondary">
              Note: This bank account number will be used for you to make
              withdrawals.
            </Body2>
            
            {/* Buttons */}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Bank Account'}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};
