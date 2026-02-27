"use client";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
  <Box
    component="footer"
    sx={{
      mt: 4,
      px: { xs: 2, sm: 4 },
      py: 3,
      borderRadius: 3,
      position: 'sticky',
      bottom: 16,
      zIndex: 2,
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
      color: 'var(--surface-text)',
      boxShadow: '0 12px 30px rgba(2, 6, 23, 0.35)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      flexWrap: 'wrap',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
      Made by Abdullah AL SALLOUM
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.8 }}>
      email:{' '}
      <Box
        component="a"
        href="mailto:abdullahalsalloum.dev@gmail.com"
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          borderBottom: '1px solid transparent',
          '&:hover': { borderBottomColor: 'currentColor' },
        }}
      >
        abdullahalsalloum.dev@gmail.com
      </Box>
    </Typography>
  </Box>
  );
};

export default Footer;
