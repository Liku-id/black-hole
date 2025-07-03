import { AuthGate } from '@/components/AuthGate';
import { useAuth } from '@/contexts/AuthContext';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';

const MOCK_USER = {
  username: 'admin',
  password: 'password123'
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      setError('');
      login();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <AuthGate requireAuth={false} redirectTo="/">
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
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
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
                />
                {error && (
                  <Typography color="error" variant="body2" mt={1} mb={1}>
                    {error}
                  </Typography>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </AuthGate>
  );
} 