'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import type { AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAppAuth } from '../../components/AuthProvider';

const getLoginErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return 'Failed to sign in.';
  }

  const code = (error as AuthError).code;

  if (code === 'auth/invalid-credential') {
    return 'Invalid email or password, or Email/Password sign-in is disabled in Firebase Authentication.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please wait a moment and try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Check your internet connection and try again.';
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Failed to sign in.';
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (submitError) {
      setError(getLoginErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '93vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'grid',
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin Login
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Email/password access for control panel admins only.
        </Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Sign in'}
        </Button>
      </Box>
    </Box>
  );
}
