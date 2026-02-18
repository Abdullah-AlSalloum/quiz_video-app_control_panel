"use client";

import type { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ProfitLastWeek: FC = () => {
  const t = useTranslations('ProfitLastWeek');

  const categories = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const series = [
    { name: t('sales'), data: [32, 44, 30, 57, 12, 33, 54] },
    { name: t('revenue'), data: [10, 20, 18, 22, 9, 16, 18] },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      foreColor: 'var(--surface-text)'
    },
    plotOptions: {
      bar: {
        columnWidth: '20%',
        borderRadius: 6
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(255,255,255,0.12)',
      strokeDashArray: 4
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: 80,
      tickAmount: 4
    },
    colors: ['#7c3aed', '#38bdf8'],
    legend: { show: false },
    tooltip: {
      theme: 'dark'
    }
  };

  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', lg: 432 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <FormControl size="small">
          <Select
            value="lastWeek"
            sx={{
              borderRadius: 2,
              color: 'var(--surface-text)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' }
            }}
          >
            <MenuItem value="lastWeek">{t('lastWeek')}</MenuItem>
            <MenuItem value="thisWeek">{t('thisWeek')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#7c3aed' }} />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>{t('sales')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#38bdf8' }} />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>{t('revenue')}</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260 }}>
        <Chart options={chartOptions} series={series} type="bar" height="100%" />
      </Box>
    </Box>
  );
};

export default ProfitLastWeek;
