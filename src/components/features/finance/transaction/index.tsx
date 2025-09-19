import { Box, useTheme } from '@mui/material';

import { Body1 } from '@/components/common';

import { FinanceTransactionTable } from './table';

const FinanceTransaction = () => {
  const theme = useTheme();

  return (
    <Box bgcolor="background.paper" padding="16px 20px">
      <Box
        borderBottom={`1px solid ${theme.palette.grey[100]}`}
        paddingBottom="16px"
      >
        <Body1 fontWeight={600}>Event Transaction Detail</Body1>
      </Box>
      <FinanceTransactionTable />
    </Box>
  );
};

export default FinanceTransaction;
