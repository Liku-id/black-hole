import { useAuth } from '@/contexts/AuthContext';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Create login data with user agent and IP (mock values for now)
    const loginData = {
      email,
      password,
      user_agent: navigator.userAgent,
      ip: '192.168.1.1' // In real app, this would come from the server
    };

    const errorMsg = await login(loginData);
    if (errorMsg) {
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }
    router.replace('/');
    setIsSubmitting(false);
  };

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
              </form>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
} 