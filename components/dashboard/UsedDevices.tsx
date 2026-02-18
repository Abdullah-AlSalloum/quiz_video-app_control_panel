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

const UsedDevices: FC = () => {
  const t = useTranslations('UsedDevices');

  const series = [65, 10, 20, 5];
  const labels = [t('desktop'), t('tablet'), t('mobile'), t('unknown')];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      foreColor: 'var(--surface-text)'
    },
    labels,
    colors: ['#6d63ff', '#4c6fff', '#8aa2ff', '#b3c4ff'],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { theme: 'dark' },
    plotOptions: {
      pie: {
        donut: {
          size: '75%'
        }
      }
    }
  };

  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: { xs: 2, sm: 9.35 },
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('title')}
        </Typography>
        <FormControl size="small">
          <Select
            value="yearly"
            sx={{
              borderRadius: 2,
              color: 'var(--surface-text)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' }
            }}
          >
            <MenuItem value="monthly">{t('monthly')}</MenuItem>
            <MenuItem value="yearly">{t('yearly')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chart options={options} series={series} type="donut" height={260} />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('visitors')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            30000
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#6d63ff' }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {t('desktop')}: 65%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#4c6fff' }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {t('tablet')}: 10%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#8aa2ff' }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {t('mobile')}: 20%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#b3c4ff' }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {t('unknown')}: 5%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UsedDevices;
