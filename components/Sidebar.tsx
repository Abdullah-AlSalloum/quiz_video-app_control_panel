import type { FC } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

const drawerWidth = 240;

const Sidebar: FC = () => {
  const t = useTranslations('app');
  const locale = useLocale();

  const handleLocaleChange = (value: string) => {
    document.cookie = `locale=${value}; path=/; max-age=31536000`;
    window.location.reload();
  };
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRight: 'none',
          boxShadow: 'none',
        },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: 24, gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #5750F1 60%, #D1D5DB 100%)' }} />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          {t('dashboard')}
        </Typography>
      </div>
      <List>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary={t('dashboard')} />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <FormControl fullWidth size="small">
            <InputLabel id="lang-select-label" sx={{ color: 'var(--surface-text)' }}>
              Language
            </InputLabel>
            <Select
              labelId="lang-select-label"
              value={locale}
              label="Language"
              onChange={(event) => handleLocaleChange(event.target.value as string)}
              sx={{
                backgroundColor: 'var(--surface)',
                color: 'var(--surface-text)',
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#2e3b4a',
                    color: '#fff',
                  },
                },
              }}
            >
              <MenuItem value="ar">Arabic</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
