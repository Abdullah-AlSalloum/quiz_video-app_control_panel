'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppAuth } from './AuthProvider';

const publicPaths = ['/login'];

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAppAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = publicPaths.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!isPublic && !user) {
      router.replace('/login');
      return;
    }

    if (isPublic && user && isAdmin) {
      router.replace('/');
      return;
    }

    if (user && !isAdmin && !isPublic) {
      router.replace('/login');
    }
  }, [loading, user, isPublic, isAdmin, router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Typography variant="body1">Loading...</Typography>
      </Box>
    );
  }

  if (!isPublic && (!user || !isAdmin)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Typography variant="body1">Redirecting…</Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
