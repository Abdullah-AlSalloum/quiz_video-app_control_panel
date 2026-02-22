"use client";

import { useEffect, useState, type FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Range = 'monthly' | 'yearly';

type UsersAnalyticsResponse = {
  categories: string[];
  series: { name: string; data: number[] }[];
  totalUsers: number;
  periodTotal: number;
};

const PaymentsOverview: FC = () => {
  const t = useTranslations('PaymentsOverview');
  const locale = useLocale();
  const [range, setRange] = useState<Range>('monthly');
  const [data, setData] = useState<UsersAnalyticsResponse | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`/api/analytics/users?range=${range}`, { cache: 'no-store' });
      if (!response.ok) {
        setData(null);
        return;
      }
      const json = (await response.json()) as UsersAnalyticsResponse;
      setData(json);
    };

    void loadData();
  }, [range]);

  const categories = data?.categories
    ? range === 'yearly'
      ? data.categories
      : data.categories.map((value) => {
          const [year, month] = value.split('-').map(Number);
          if (!year || !month) return value;
          const date = new Date(year, month - 1, 1);
          return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
        })
    : [];

  const series = data?.series?.length
    ? data.series.map((item) => ({
        name: t('newUsers'),
        data: item.data,
      }))
    : [{ name: t('newUsers'), data: [] }];

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
      tickAmount: 5,
    },
    colors: ['#38bdf8'],
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
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
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
            {t('periodNewUsers')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {data?.periodTotal ?? 0}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('totalUsers')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {data?.totalUsers ?? 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentsOverview;
