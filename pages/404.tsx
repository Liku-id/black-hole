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
          <Typography variant="h1" sx={{ mb: 2, color: 'text.primary' }}>
            404
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.secondary' }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            The page you are looking for does not exist.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
