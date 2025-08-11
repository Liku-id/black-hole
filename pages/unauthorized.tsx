import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

const UnauthorizedPage: React.FC & { requireAuth?: boolean } = () => {
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
        background:
          'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #d63031 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 16px rgba(255, 107, 107, 0.3)'
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '2rem'
              }}
            >
              ⚠️
            </Typography>
          </Box>

          {/* Main Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#2c3e50',
              mb: 1,
              background: 'linear-gradient(45deg, #2c3e50, #34495e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Access Denied
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              color: '#7f8c8d',
              mb: 3,
              fontWeight: 500
            }}
          >
            Unauthorized Access
          </Typography>

          {/* Divider */}
          <Box
            sx={{
              width: 60,
              height: 3,
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              mx: 'auto',
              mb: 3,
              borderRadius: 2
            }}
          />

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#5a6c7d',
              mb: 2,
              lineHeight: 1.6,
              fontSize: '1rem'
            }}
          >
            You don't have the required permissions to access this application.
            Only administrators, business development, and event organizer PIC
            users are allowed to access this system.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#7f8c8d',
              mb: 4,
              fontSize: '0.9rem'
            }}
          >
            If you believe this is an error, please contact your system
            administrator.
          </Typography>

          {/* Button */}
          <Button
            variant="contained"
            size="medium"
            onClick={handleLogout}
            sx={{
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c0392b, #a93226)',
                boxShadow: '0 6px 16px rgba(231, 76, 60, 0.6)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Return to Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

UnauthorizedPage.requireAuth = false;

export default UnauthorizedPage;
