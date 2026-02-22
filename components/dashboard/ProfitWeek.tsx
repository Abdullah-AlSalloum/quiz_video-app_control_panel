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

type Range = '7d' | '30d';

type QuizAttemptsResponse = {
  categories: string[];
  series: { name: string; data: number[] }[];
  periodTotal: number;
  totalAttempts: number;
};

const ProfitLastWeek: FC = () => {
  const t = useTranslations('ProfitLastWeek');
  const locale = useLocale();
  const [range, setRange] = useState<Range>('7d');
  const [data, setData] = useState<QuizAttemptsResponse | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`/api/analytics/quiz-attempts?range=${range}`, { cache: 'no-store' });
      if (!response.ok) {
        setData(null);
        return;
      }
      const json = (await response.json()) as QuizAttemptsResponse;
      setData(json);
    };

    void loadData();
  }, [range]);

  const categories = data?.categories
    ? data.categories.map((value) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return value;
        const date = new Date(year, month - 1, day);
        const options: Intl.DateTimeFormatOptions =
          range === '7d' ? { weekday: 'short' } : { month: 'short', day: 'numeric' };
        return new Intl.DateTimeFormat(locale, options).format(date);
      })
    : [];

  const series = data?.series?.length
    ? [
        {
          name: t('videoAttempts'),
          data: data.series.find((item) => item.name === 'video')?.data ?? [],
        },
        {
          name: t('finalAttempts'),
          data: data.series.find((item) => item.name === 'final')?.data ?? [],
        },
      ]
    : [
        { name: t('videoAttempts'), data: [] },
        { name: t('finalAttempts'), data: [] },
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
        columnWidth: '24%',
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
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
            sx={{
              borderRadius: 2,
              color: 'var(--surface-text)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' }
            }}
          >
            <MenuItem value="7d">{t('lastWeek')}</MenuItem>
            <MenuItem value="30d">{t('thisWeek')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#7c3aed' }} />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>{t('videoAttempts')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#38bdf8' }} />
          <Typography variant="body2" sx={{ opacity: 0.7 }}>{t('finalAttempts')}</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260 }}>
        <Chart options={chartOptions} series={series} type="bar" height="100%" />
      </Box>
    </Box>
  );
};

export default ProfitLastWeek;
