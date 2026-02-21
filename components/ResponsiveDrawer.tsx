'use client';

import { useEffect, useState, type ReactNode } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Sidebar from './Sidebar';
import AppBar from './AppBar';

interface ResponsiveDrawerProps {
  children: ReactNode;
}

const drawerWidth = 240;

const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)', { noSsr: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              background: 'var(--surface)',
              color: 'var(--surface-text)',
            },
          }}
        >
          <Sidebar />
        </Drawer>
      ) : (
        <Sidebar />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar showMenu={isMobile} onMenuClick={handleDrawerToggle} />
        {children}
      </div>
    </div>
  );
};

export default ResponsiveDrawer;
