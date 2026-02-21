"use client";
import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import 'jsvectormap/dist/jsvectormap.css';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world-merc.js';

const RegionLabelsMap = () => {
  const t = useTranslations('RegionLabels');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<InstanceType<typeof jsVectorMap> | null>(null);

  useEffect(() => {
    const mapEl = mapRef.current;
    if (!mapEl) return;
    if (mapInstance.current) {
      mapInstance.current.destroy();
      mapInstance.current = null;
    }
    mapEl.innerHTML = '';

    mapInstance.current = new jsVectorMap({
      selector: mapEl,
      map: 'world_merc',
      backgroundColor: 'transparent',
      zoomButtons: true,
      regionStyle: {
        initial: {
          fill: '#cbd5e1',
          stroke: '#475569',
          strokeWidth: 0.6
        },
        hover: {
          fill: '#5b6bf2'
        }
      },
      markers: [],
      selectedRegions: ['US'],
      regionStyleSelected: {
        fill: '#3b82f6'
      },
      regionTooltip: {
        render: (code: string, name: string) => `${name} (${code})`
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      mapEl.innerHTML = '';
    };
  }, []);

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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('title')}
      </Typography>
      <Box className="region-map" sx={{ height: 420 }} ref={mapRef} />
    </Box>
  );
};

export default RegionLabelsMap;
