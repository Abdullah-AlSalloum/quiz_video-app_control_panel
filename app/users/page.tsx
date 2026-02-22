"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslations } from 'next-intl';

type UserRow = {
  id: string;
  name: string;
  surname: string;
  email: string;
  videoQuizzes: number;
  finalQuizzes: number;
};

export default function UsersPage() {
  const t = useTranslations('users');
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(t('loadError'));
      }
      const data = (await response.json()) as { users: UserRow[] };
      setRows(data.users ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => {
    const total = rows.length;
    const totalVideo = rows.reduce((sum, row) => sum + row.videoQuizzes, 0);
    const totalFinal = rows.reduce((sum, row) => sum + row.finalQuizzes, 0);
    return { total, totalVideo, totalFinal };
  }, [rows]);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {t('subtitle')}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
            {t('stats', { total: stats.total, video: stats.totalVideo, final: stats.totalFinal })}
          </Typography>
        </Box>
        <Tooltip title={t('refresh')}>
          <span>
            <IconButton onClick={() => void loadUsers()} disabled={loading} sx={{ background: 'rgba(125,125,125,0.12)' }}>
              {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 56 }}>{t('table.number')}</TableCell>
                <TableCell>{t('table.name')}</TableCell>
                <TableCell>{t('table.surname')}</TableCell>
                <TableCell>{t('table.email')}</TableCell>
                <TableCell align="center">{t('table.videoQuizzes')}</TableCell>
                <TableCell align="center">{t('table.finalQuizzes')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length == 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5, opacity: 0.75 }}>
                    {t('emptyState')}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.name || '-'}</TableCell>
                    <TableCell>{row.surname || '-'}</TableCell>
                    <TableCell>{row.email || '-'}</TableCell>
                    <TableCell align="center">{row.videoQuizzes}</TableCell>
                    <TableCell align="center">{row.finalQuizzes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
