"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslations } from 'next-intl';

type VideoRow = {
  id: string;
  videoId: string;
  titleAr: string;
  titleEn: string;
  order: number;
  courseId: string;
  questionsCount: number;
};

type CourseOption = {
  id: string;
  titleAr: string;
};

export default function VideosPage() {
  const t = useTranslations('videos');
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseMap = useMemo(() => {
    return courses.reduce<Record<string, string>>((acc, course) => {
      acc[course.id] = course.titleAr || course.id;
      return acc;
    }, {});
  }, [courses]);

  const loadCourses = useCallback(async () => {
    const response = await fetch('/api/courses', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(t('loadError'));
    }
    const data = (await response.json()) as { courses: CourseOption[] };
    setCourses(data.courses ?? []);
  }, [t]);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedCourseId) {
        params.set('courseId', selectedCourseId);
      }
      const response = await fetch(`/api/videos${params.toString() ? `?${params.toString()}` : ''}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(t('loadError'));
      }
      const data = (await response.json()) as { videos: VideoRow[] };
      setRows(data.videos ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, t]);

  useEffect(() => {
    void loadCourses().catch(() => {
      setError(t('loadError'));
    });
  }, [loadCourses, t]);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('refresh')}>
            <span>
              <IconButton onClick={() => void loadVideos()} disabled={loading} sx={{ background: 'rgba(125,125,125,0.12)' }}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="course-filter-label">{t('filter.course')}</InputLabel>
          <Select
            labelId="course-filter-label"
            label={t('filter.course')}
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
          >
            <MenuItem value="">{t('filter.all')}</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.titleAr || course.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          background: 'var(--surface)',
          color: 'var(--surface-text)',
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('table.titleAr')}</TableCell>
                <TableCell>{t('table.titleEn')}</TableCell>
                <TableCell>{t('table.course')}</TableCell>
                <TableCell align="center">{t('table.order')}</TableCell>
                <TableCell align="center">{t('table.questions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, opacity: 0.75 }}>
                    {t('emptyState')}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.titleAr || row.videoId}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        {row.videoId}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.titleEn || '-'}</TableCell>
                    <TableCell>{courseMap[row.courseId] ?? row.courseId ?? '-'}</TableCell>
                    <TableCell align="center">{row.order}</TableCell>
                    <TableCell align="center">{row.questionsCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
