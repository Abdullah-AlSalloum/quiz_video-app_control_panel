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

const PaymentsOverview: FC = () => {
  const t = useTranslations('PaymentsOverview');

  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const series = [
    { name: t('received'), data: [15, 25, 35, 28, 30, 55, 65, 50, 62, 70, 58, 66] },
    { name: t('due'), data: [10, 20, 22, 26, 24, 45, 80, 65, 78, 90, 72, 60] },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: 'var(--surface-text)',
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.12)',
      strokeDashArray: 4,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    colors: ['#7c3aed', '#38bdf8'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    tooltip: {
      theme: 'dark',
      x: { formatter: (val: string) => val },
    },
    legend: { show: false },
  };

  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <FormControl size="small">
          <Select
            value="monthly"
            sx={{
              borderRadius: 2,
              color: 'var(--surface-text)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <MenuItem value="monthly">{t('monthly')}</MenuItem>
            <MenuItem value="yearly">{t('yearly')}</MenuItem>
          </Select>
        </FormControl>
        
      </Box>

      <Box sx={{ position: 'relative', height: 260, mb: 2 }}>
        <Chart options={chartOptions} series={series} type="area" height={260} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('receivedAmount')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            $580.00
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('dueAmount')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            $628.00
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentsOverview;
