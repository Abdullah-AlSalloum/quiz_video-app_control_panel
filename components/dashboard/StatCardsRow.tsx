import type { FC } from 'react';
import Box from '@mui/material/Box';
import StatCard from './StatCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslations } from 'next-intl';

const StatCardsRow: FC = () => {
  const t = useTranslations('StatCardsRow');

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#22c55e',
              color: '#fff',
            }}
          >
            <VisibilityIcon />
          </Box>
        }
        value="3.5K"
        label={t('totalViews')}
        change="0.43%"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f59e0b',
              color: '#fff',
            }}
          >
            <AttachMoneyIcon />
          </Box>
        }
        value="$4.2K"
        label={t('totalProfit')}
        change="4.35%"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#7c3aed',
              color: '#fff',
            }}
          >
            <Inventory2Icon />
          </Box>
        }
        value="3.5K"
        label={t('totalProducts')}
        change="2.59%"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0ea5e9',
              color: '#fff',
            }}
          >
            <GroupIcon />
          </Box>
        }
        value="3.5K"
        label={t('totalUsers')}
        change="-0.95%"
        trend="down"
      />
    </Box>
  );
};

export default StatCardsRow;
