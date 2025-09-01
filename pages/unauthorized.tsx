import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export default function Unauthorized() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');

    // Redirect to login
    router.push('/login');
  };

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
          <Typography sx={{ mb: 2, color: 'error.main' }} variant="h1">
            ⚠️
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.primary' }} variant="h4">
            Access Denied
          </Typography>
          <Typography sx={{ mb: 4, color: 'text.secondary' }} variant="body1">
            You don't have permission to access this page.
          </Typography>
          <Button
            sx={{ mr: 2 }}
            variant="contained"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button color="error" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
