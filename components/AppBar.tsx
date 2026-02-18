'use client';

import { useState, type FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import { useThemeMode } from './ThemeProvider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';

type AppBarProps = {
  onMenuClick?: () => void;
  showMenu?: boolean;
};

const CustomAppBar: FC<AppBarProps> = ({ onMenuClick, showMenu = false }) => {
  const isMobile = useMediaQuery('(max-width:600px)', { noSsr: true });
  const { mode, toggleMode } = useThemeMode();
  const t = useTranslations('app');
  const searchBg = mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconBtnSx = {
    background: searchBg,
    borderRadius: '999px',
    width: 36,
    height: 36,
    '&:hover': { background: searchBg },
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };
  const handleSearchOpen = () => {
    setSearchOpen(true);
  };
  const handleSearchClose = () => {
    setSearchOpen(false);
  };
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'var(--surface)',
        color: 'var(--surface-text)',
        borderBottom: 'none',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', minHeight: { xs: 64, sm: 80 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {showMenu && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, ...(isMobile ? iconBtnSx : {}) }}
              onClick={onMenuClick}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" color="inherit" noWrap sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {t('dashboard')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {!isMobile && (
            <Box
              sx={{
                position: 'relative',
                borderRadius: 999,
                background: searchBg,
                mr: 2,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                boxShadow: 'none',
                px: 1,
                cursor: 'pointer',
              }}
              role="button"
              aria-label="open search"
              onClick={handleSearchOpen}
            >
              <Box sx={{ p: 1, position: 'absolute', pointerEvents: 'none', color: 'inherit', opacity: 0.6 }}>
                <SearchIcon />
              </Box>
              <InputBase
                placeholder={t('search')}
                sx={{ color: 'inherit', pl: 4, width: { xs: 180, sm: 260 }, border: 'none', outline: 'none' }}
                inputProps={{ 'aria-label': 'search' }}
                readOnly
              />
            </Box>
          )}
          {isMobile ? (
            <>
              <IconButton color="inherit" aria-label="search" onClick={handleSearchOpen} sx={iconBtnSx}>
                <SearchIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="toggle theme" onClick={toggleMode} sx={iconBtnSx}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton color="inherit" aria-label="notifications" onClick={handleNotifOpen} sx={iconBtnSx}>
                <Badge color="error" variant="dot">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </>
          ) : null}
          {!isMobile && (
            <IconButton color="inherit" aria-label="toggle theme" onClick={toggleMode} sx={iconBtnSx}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          )}
          {!isMobile && (
            <IconButton color="inherit" onClick={handleNotifOpen} aria-label="notifications">
              <Badge color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
            aria-controls={menuOpen ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <Avatar alt="Abdullah" sx={{ width: 32, height: 32 }}>A</Avatar>
            {!isMobile && (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Abdullah AL SALLOUM
              </Typography>
            )}
            {!isMobile && <ExpandMoreIcon fontSize="small" />}
          </Box>
        </Box>
      </Toolbar>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            backgroundColor: 'var(--surface)',
            color: 'var(--surface-text)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
          <Avatar alt="Abdullah" sx={{ width: 40, height: 40 }}>A</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Abdullah AL SALLOUM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              abdullah@example.com
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          {t('viewProfile')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t('accountSettings')}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('logout')}
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={notifAnchorEl}
        open={notifOpen}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            borderRadius: 2,
            p: 0,
            backgroundColor: 'var(--surface)',
            color: 'var(--surface-text)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('notifications')}
          </Typography>
          <Box
            sx={{
              background: '#5750F1',
              color: '#fff',
              borderRadius: 1.5,
              px: 1.2,
              py: 0.2,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {t('newCount', { count: 5 })}
          </Box>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {[
            {
              title: 'Piter Joined the Team!',
              subtitle: 'Congratulate him',
              avatar: '/avatar.jpg',
            },
            {
              title: 'New message',
              subtitle: 'Devid sent a new message',
              avatar: '/avatar.jpg',
            },
            {
              title: 'New Payment received',
              subtitle: 'Check your earnings',
              avatar: '/avatar.jpg',
            },
            {
              title: 'Jolly completed tasks',
              subtitle: 'Assign new task',
              avatar: '/avatar.jpg',
            },
            {
              title: 'Roman Joined the Team!',
              subtitle: 'Congratulate him',
              avatar: '/avatar.jpg',
            },
          ].map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1.5, px: 2, py: 1.25 }}>
              <Avatar alt={item.title} sx={{ width: 40, height: 40 }}>U</Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Button variant="outlined" fullWidth sx={{ borderRadius: 2, textTransform: 'none' }}>
            {t('seeAllNotifications')}
          </Button>
        </Box>
      </Menu>
      <Dialog
        open={searchOpen}
        onClose={handleSearchClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            background: 'var(--surface)',
            color: 'var(--surface-text)',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <SearchIcon sx={{ opacity: 0.6 }} />
            <InputBase
              autoFocus
              placeholder={t('siteSearch')}
              sx={{ flex: 1, color: 'inherit' }}
              inputProps={{ 'aria-label': 'site search' }}
            />
            <IconButton onClick={handleSearchClose} aria-label="close search">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 2, py: 4, textAlign: 'center', color: 'text.secondary' }}>
            {t('enterKeywords')}
          </Box>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
};

export default CustomAppBar;
