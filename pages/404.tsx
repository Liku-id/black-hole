import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Box textAlign="center">
          <Typography sx={{ mb: 2, color: 'text.primary' }} variant="h1">
            404
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }} variant="h4">
            Page Not Found
          </Typography>
          <Typography sx={{ mb: 4, color: 'text.secondary' }} variant="body1">
            The page you are looking for does not exist.
          </Typography>
          <Button
            sx={{ mr: 2 }}
            variant="contained"
            onClick={() => router.push('/events')}
          >
            Go to Dashboard
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
