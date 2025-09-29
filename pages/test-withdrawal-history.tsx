import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export default function TestWithdrawalHistory() {
  const router = useRouter();

  const handleTestNavigation = () => {
    // Test dengan metaUrl yang ada
    router.push('/finance/withdrawal/test-event/history');
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Test Withdrawal History Navigation
      </Typography>
      <Button variant="contained" onClick={handleTestNavigation}>
        Test Navigate to Withdrawal History
      </Button>
    </Box>
  );
}
