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
          <Typography variant="h1" sx={{ mb: 2, color: 'error.main' }}>
            ⚠️
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: 'text.primary' }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            You don't have permission to access this page.
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
            onClick={handleLogout}
            color="error"
          >
            Logout
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
