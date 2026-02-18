import type { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export type StatCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: string;
  trend: 'up' | 'down';
};

const StatCard: FC<StatCardProps> = ({ icon, value, label, change, trend }) => {
  const trendColor = trend === 'up' ? '#22c55e' : '#ef4444';

  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: 3,
        minHeight: 180,
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{icon}</Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trendColor, fontWeight: 700 }}>
          <Typography variant="body2" sx={{ color: trendColor }}>
            {change}
          </Typography>
          {trend === 'up' ? (
            <ArrowUpwardIcon sx={{ fontSize: 16, color: trendColor }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 16, color: trendColor }} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StatCard;
