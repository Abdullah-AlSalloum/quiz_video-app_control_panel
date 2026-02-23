"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import 'jsvectormap/dist/jsvectormap.css';

type Range = 'week' | 'month' | 'year';

type CountryCount = {
  code: string;
  name: string;
  count: number;
};

type CountriesResponse = {
  countries: CountryCount[];
  totalUsers: number;
};

const RegionLabelsMap = () => {
  const t = useTranslations('RegionLabels');
  const usersLabel = t('users');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<{ destroy: () => void } | null>(null);
  const [range, setRange] = useState<Range>('month');
  const [data, setData] = useState<CountriesResponse | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`/api/analytics/countries?range=${range}`, { cache: 'no-store' });
      if (!response.ok) {
        setData(null);
        return;
      }
      const json = (await response.json()) as CountriesResponse;
      setData(json);
    };

    void loadData();
  }, [range]);

  const values = useMemo(() => {
    const mapping: Record<string, number> = {};
    if (!data?.countries) return mapping;
    data.countries.forEach((country) => {
      mapping[country.code] = country.count;
    });
    return mapping;
  }, [data?.countries]);

  const topCountries = useMemo(() => {
    if (!data?.countries?.length) return [];
    return data.countries.slice(0, 5);
  }, [data?.countries]);

  useEffect(() => {
    const mapEl = mapRef.current;
    if (!mapEl) return;
    if (mapInstance.current) {
      mapInstance.current.destroy();
      mapInstance.current = null;
    }
    mapEl.innerHTML = '';

    let cancelled = false;

    const initMap = async () => {
      try {
        const [{ default: JsVectorMap }] = await Promise.all([
          import('jsvectormap'),
          import('jsvectormap/dist/maps/world-merc.js'),
        ]);

        if (cancelled || !mapRef.current) return;

        mapInstance.current = new JsVectorMap({
          selector: mapRef.current,
          map: 'world_merc',
          backgroundColor: 'transparent',
          zoomButtons: true,
          regionStyle: {
            initial: {
              fill: '#cbd5e1',
              stroke: '#475569',
              strokeWidth: 0.6,
            },
            hover: {
              fill: '#5b6bf2',
            },
          },
          markers: [],
          series: {
            regions: [
              {
                values,
                scale: ['#cbd5e1', '#1d4ed8'],
                normalizeFunction: 'polynomial',
              },
            ],
          },
          regionTooltip: {
            render: (code: string, name: string) => {
              const count = values[code] ?? 0;
              return `${name} (${code}) - ${count} ${usersLabel}`;
            },
          },
        });

        setMapError(false);
      } catch {
        if (!cancelled) {
          setMapError(true);
        }
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      mapEl.innerHTML = '';
    };
  }, [usersLabel, values]);

  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)'
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
            <MenuItem value="week">{t('week')}</MenuItem>
            <MenuItem value="month">{t('month')}</MenuItem>
            <MenuItem value="year">{t('year')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box className="region-map" sx={{ height: 420 }} ref={mapRef} />
      {mapError ? (
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
          {t('noData')}
        </Typography>
      ) : null}
      <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
        {topCountries.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t('noData')}
          </Typography>
        ) : (
          topCountries.map((country) => (
            <Box
              key={country.code}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="body2">
                {country.name || country.code}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {country.count}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default RegionLabelsMap;
