'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useAppAuth } from '../../components/AuthProvider';

export default function ProfilePage() {
  const { user, profile, changePassword } = useAppAuth();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordUpdate = async () => {
    setError(null);
    setStatus(null);

    if (newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await changePassword(newPassword.trim());
      setStatus('Password updated successfully.');
      setNewPassword('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update password.');
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          display: 'grid',
          gap: 2,
          maxWidth: 700,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {status ? <Alert severity="success">{status}</Alert> : null}

        <TextField label="Name" value={profile?.displayName ?? ''} InputProps={{ readOnly: true }} fullWidth />
        <TextField label="Email" value={user?.email ?? ''} InputProps={{ readOnly: true }} fullWidth />
        <TextField label="Role" value={profile?.role ?? 'user'} InputProps={{ readOnly: true }} fullWidth />

        <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
          Change password
        </Typography>
        <TextField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          fullWidth
        />
        <Box>
          <Button variant="contained" onClick={handlePasswordUpdate}>
            Update password
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
