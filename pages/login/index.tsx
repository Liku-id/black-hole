import { useAuth } from '@/contexts/AuthContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  TextField,
  Typography
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.replace('/');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Create login data with just email and password
    const loginData = {
      email,
      password
    };

    const errorMsg = await login(loginData);
    if (errorMsg) {
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }
    
    // Manual redirect after successful login
    router.replace('/');
    setIsSubmitting(false);
  };

  // Don't render if already logged in
  if (isLoggedIn && !isLoading) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Login - TMS</title>
      </Head>
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box width="100%">
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Typography variant="h2" fontWeight="bold" mt={2} mb={1}>Sign In</Typography>
                <Chip
                  icon={<AdminPanelSettingsIcon />}
                  label="Admin Access Only"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || isLoading}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting || isLoading}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  disabled={isSubmitting || isLoading}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                <Box mt={2} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Only administrators can access this system.
                  </Typography>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
} 