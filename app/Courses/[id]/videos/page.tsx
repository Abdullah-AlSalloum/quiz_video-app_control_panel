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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type VideoRow = {
  id: string;
  videoId: string;
  titleAr: string;
  order: number;
  questionsCount: number;
};

type CourseInfo = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  imageUrl: string;
  instructor: string;
  published: boolean;
};

export default function CourseVideosPage() {
  const t = useTranslations('videos');
  const params = useParams<{ id: string }>();
  const courseId = params?.id ?? '';

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoRow | null>(null);
  const [form, setForm] = useState({
    videoId: '',
    titleAr: '',
  });

  const headerTitle = useMemo(() => {
    return t('courseTitle', { course: course?.titleAr || courseId || t('courseFallback') });
  }, [course?.titleAr, courseId, t]);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    const response = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(t('loadError'));
    }
    const data = (await response.json()) as { course?: CourseInfo };
    setCourse(data.course ?? null);
  }, [courseId, t]);

  const loadVideos = useCallback(async () => {
    if (!courseId) return;
    const response = await fetch(`/api/videos?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(t('loadError'));
    }
    const data = (await response.json()) as { videos: VideoRow[] };
    const sorted = [...(data.videos ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const needsReindex = sorted.some((row, index) => (row.order ?? 0) !== index + 1);
    if (needsReindex) {
      try {
        await fetch('/api/videos/reindex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });
      } catch {
        // Keep current view even if reindex fails.
      }
      const updated = sorted.map((row, index) => ({ ...row, order: index + 1 }));
      setRows(updated);
      return;
    }
    setRows(sorted);
  }, [courseId, t]);

  const reloadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadCourse(), loadVideos()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [loadCourse, loadVideos, t]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  const handleCreateOpen = () => {
    setForm({ videoId: '', titleAr: '' });
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    if (savingId) return;
    setCreateOpen(false);
  };

  const handleEditOpen = (row: VideoRow) => {
    setEditingVideo(row);
    setForm({
      videoId: row.videoId,
      titleAr: row.titleAr,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    if (savingId) return;
    setEditOpen(false);
    setEditingVideo(null);
  };

  const handleCreateSave = async () => {
    if (!courseId) return;
    if (!form.videoId.trim() || !form.titleAr.trim()) {
      setError(t('validationRequired'));
      return;
    }
    setSavingId('create');
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          videoId: form.videoId.trim(),
          titleAr: form.titleAr.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(t('createError'));
      }
      await loadVideos();
      setCreateOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('createError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;
    if (!form.videoId.trim() || !form.titleAr.trim()) {
      setError(t('validationRequired'));
      return;
    }
    const previousRows = rows;
    setSavingId(editingVideo.id);
    setRows((current) =>
      current.map((row) =>
        row.id === editingVideo.id
          ? {
              ...row,
              videoId: form.videoId.trim(),
              titleAr: form.titleAr.trim(),
            }
          : row,
      ),
    );

    try {
      const response = await fetch(`/api/videos/${editingVideo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: form.videoId.trim(),
          titleAr: form.titleAr.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(t('updateError'));
      }
      setEditOpen(false);
    } catch (saveError) {
      setRows(previousRows);
      setError(saveError instanceof Error ? saveError.message : t('updateError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (row: VideoRow) => {
    const confirmDelete = window.confirm(t('deleteConfirm'));
    if (!confirmDelete) return;
    const previousRows = rows;
    setRows((current) => current.filter((item) => item.id !== row.id));
    setSavingId(row.id);
    try {
      const response = await fetch(`/api/videos/${row.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(t('deleteError'));
      }
    } catch (deleteError) {
      setRows(previousRows);
      setError(deleteError instanceof Error ? deleteError.message : t('deleteError'));
    } finally {
      setSavingId(null);
    }
  };

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
            {headerTitle}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {t('courseSubtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button component={Link} href="/Courses" startIcon={<ArrowBackIcon />} variant="outlined">
            {t('backToCourses')}
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={handleCreateOpen}>
            {t('actions.add')}
          </Button>
          <Tooltip title={t('refresh')}>
            <span>
              <IconButton onClick={() => void reloadAll()} disabled={loading} sx={{ background: 'rgba(125,125,125,0.12)' }}>
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
                <TableCell align="center">{t('table.order')}</TableCell>
                <TableCell align="center">{t('table.questions')}</TableCell>
                <TableCell align="center">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, opacity: 0.75 }}>
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
                    <TableCell align="center">{row.order}</TableCell>
                    <TableCell align="center">{row.questionsCount}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={t('actions.edit')}>
                          <span>
                            <IconButton size="small" disabled={savingId === row.id} onClick={() => handleEditOpen(row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={t('actions.remove')}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={savingId === row.id}
                              onClick={() => void handleDelete(row)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'var(--surface)',
            color: 'var(--surface-text)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>{t('actions.add')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2.5, overflow: 'visible' }}>
          <TextField
            label={t('form.videoId')}
            value={form.videoId}
            onChange={(event) => setForm((prev) => ({ ...prev, videoId: event.target.value }))}
            fullWidth
          />
          <TextField
            label={t('table.titleAr')}
            value={form.titleAr}
            onChange={(event) => setForm((prev) => ({ ...prev, titleAr: event.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} disabled={Boolean(savingId)}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={() => void handleCreateSave()} variant="contained" disabled={Boolean(savingId)}>
            {t('actions.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: 'var(--surface)',
            color: 'var(--surface-text)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>{t('actions.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2.5, overflow: 'visible' }}>
          <TextField
            label={t('form.videoId')}
            value={form.videoId}
            onChange={(event) => setForm((prev) => ({ ...prev, videoId: event.target.value }))}
            fullWidth
            
          />
          <TextField
            label={t('table.titleAr')}
            value={form.titleAr}
            onChange={(event) => setForm((prev) => ({ ...prev, titleAr: event.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={Boolean(savingId)}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={() => void handleEditSave()} variant="contained" disabled={Boolean(savingId)}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
