"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import QuizIcon from '@mui/icons-material/Quiz';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type CourseRow = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  imageUrl: string;
  instructor: string;
  published: boolean;
  videoCount: number;
  finalQuizCount: number;
  createdAt?: number;
};

export default function CoursesPage() {
  const t = useTranslations('courses');
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dzsnl3sgt';
  const maxImageSizeBytes = 8 * 1024 * 1024;
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);
  const [editForm, setEditForm] = useState({
    titleAr: '',
    descriptionAr: '',
    instructor: '',
    imageUrl: '',
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingCreateImage, setUploadingCreateImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [createPreviewError, setCreatePreviewError] = useState(false);
  const [editPreviewError, setEditPreviewError] = useState(false);
  const [createForm, setCreateForm] = useState({
    titleAr: '',
    descriptionAr: '',
    instructor: '',
    imageUrl: '',
  });
  const createImageInputRef = useRef<HTMLInputElement | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(t('uploadInvalidType'));
      }
      if (file.size > maxImageSizeBytes) {
        throw new Error(t('uploadTooLarge'));
      }
      if (!cloudName) {
        throw new Error(t('uploadConfigError'));
      }

      const signatureResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'courses' }),
      });

      if (!signatureResponse.ok) {
        throw new Error(t('uploadError'));
      }

      const signatureData = (await signatureResponse.json()) as {
        timestamp?: number;
        signature?: string;
        apiKey?: string;
        folder?: string;
      };

      if (!signatureData.signature || !signatureData.apiKey || !signatureData.timestamp) {
        throw new Error(t('uploadError'));
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', String(signatureData.timestamp));
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder ?? 'courses');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('uploadError'));
      }

      const data = (await response.json()) as { secure_url?: string };
      if (!data.secure_url) {
        throw new Error(t('uploadError'));
      }

      return data.secure_url;
    },
    [cloudName, maxImageSizeBytes, t],
  );

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/courses', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(t('loadError'));
      }
      const data = (await response.json()) as { courses: CourseRow[] };
      const nextRows = [...(data.courses ?? [])].sort((a, b) => {
        const aTime = a.createdAt ?? 0;
        const bTime = b.createdAt ?? 0;
        return aTime - bTime;
      });
      setRows(nextRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const togglePublished = async (courseId: string, nextValue: boolean) => {
    const previousRows = rows;
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === courseId ? { ...row, published: nextValue } : row)),
    );
    setSavingId(courseId);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextValue }),
      });
      if (!response.ok) {
        throw new Error(t('updateError'));
      }
    } catch (updateError) {
      setRows(previousRows);
      setError(updateError instanceof Error ? updateError.message : t('updateError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (courseId: string) => {
    const confirmDelete = window.confirm(t('deleteConfirm'));
    if (!confirmDelete) return;
    const previousRows = rows;
    setRows((currentRows) => currentRows.filter((row) => row.id !== courseId));
    setSavingId(courseId);
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
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

  const handleEditOpen = (course: CourseRow) => {
    setEditingCourse(course);
    setEditPreviewError(false);
    setEditForm({
      titleAr: course.titleAr,
      descriptionAr: course.descriptionAr,
      instructor: course.instructor,
      imageUrl: course.imageUrl,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditingCourse(null);
  };

  const handleEditSave = async () => {
    if (!editingCourse) return;
    const courseId = editingCourse.id;
    const previousRows = rows;
    setSavingId(courseId);
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === courseId
          ? {
              ...row,
              titleAr: editForm.titleAr,
              descriptionAr: editForm.descriptionAr,
              instructor: editForm.instructor,
              imageUrl: editForm.imageUrl,
            }
          : row,
      ),
    );

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: editForm.titleAr,
          descriptionAr: editForm.descriptionAr,
          instructor: editForm.instructor,
          imageUrl: editForm.imageUrl,
        }),
      });
      if (!response.ok) {
        throw new Error(t('updateError'));
      }
      handleEditClose();
    } catch (saveError) {
      setRows(previousRows);
      setError(saveError instanceof Error ? saveError.message : t('updateError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateOpen = () => {
    setCreatePreviewError(false);
    setCreateForm({
      titleAr: '',
      descriptionAr: '',
      instructor: '',
      imageUrl: '',
    });
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    if (creating) return;
    setCreateOpen(false);
  };

  const handleCreateSave = async () => {
    if (!createForm.titleAr.trim()) {
      setError(t('createValidationTitle'));
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: createForm.titleAr,
          descriptionAr: createForm.descriptionAr,
          instructor: createForm.instructor,
          imageUrl: createForm.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(t('createError'));
      }

      const data = (await response.json()) as { course?: CourseRow };
      if (data.course) {
        setRows((current) => [data.course as CourseRow, ...current]);
      } else {
        await loadCourses();
      }
      setCreateOpen(false);
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t('createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleCreateImagePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingCreateImage(true);
    setError(null);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setCreatePreviewError(false);
      setCreateForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('uploadError'));
    } finally {
      setUploadingCreateImage(false);
    }
  };

  const handleEditImagePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingEditImage(true);
    setError(null);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setEditPreviewError(false);
      setEditForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('uploadError'));
    } finally {
      setUploadingEditImage(false);
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const published = rows.filter((row) => row.published).length;
    const totalVideos = rows.reduce((sum, row) => sum + row.videoCount, 0);

    return { total, published, totalVideos };
  }, [rows]);

  const [columnWidths, setColumnWidths] = useState({
    number: 60,
    course: 260,
    description: 320,
    instructor: 180,
    videos: 100,
    finalQuiz: 180,
    published: 110,
    actions: 200,
  });

  const resizingRef = useRef<{
    key: keyof typeof columnWidths;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!resizingRef.current) return;
    const { key, startX, startWidth } = resizingRef.current;
    const delta = event.clientX - startX;
    const nextWidth = Math.max(80, startWidth + delta);
    setColumnWidths((prev) => ({
      ...prev,
      [key]: nextWidth,
    }));
  }, []);

  const stopResize = useCallback(() => {
    resizingRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopResize);
  }, [handleMouseMove]);

  const startResize = (key: keyof typeof columnWidths) => (event: React.MouseEvent<HTMLDivElement>) => {
    resizingRef.current = {
      key,
      startX: event.clientX,
      startWidth: columnWidths[key],
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [handleMouseMove, stopResize]);

  useEffect(() => {
    setEditPreviewError(false);
  }, [editForm.imageUrl]);

  useEffect(() => {
    setCreatePreviewError(false);
  }, [createForm.imageUrl]);

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>
            {t('addCourse')}
          </Button>
          <Tooltip title={t('refresh')}>
            <span>
              <IconButton onClick={() => void loadCourses()} disabled={loading} sx={{ background: 'rgba(125,125,125,0.12)' }}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <StatCard label={t('stats.totalCourses')} value={stats.total} />
        <StatCard label={t('stats.publishedCourses')} value={stats.published} />
        <StatCard label={t('stats.totalVideos')} value={stats.totalVideos} />
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
                <TableCell align="center" sx={{ width: columnWidths.number, minWidth: columnWidths.number, maxWidth: columnWidths.number }}>
                  {t('table.number')}
                </TableCell>
                <TableCell sx={{ width: columnWidths.course, minWidth: columnWidths.course, maxWidth: columnWidths.course }}>
                  <Box sx={{ position: 'relative', pr: 2 }}>
                    {t('table.course')}
                    <Box
                      onMouseDown={startResize('course')}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 8,
                        height: '100%',
                        cursor: 'col-resize',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '""',
                          width: '1px',
                          height: '60%',
                          backgroundColor: 'rgba(148, 163, 184, 0.65)',
                        },
                        '&:hover::after': {
                          backgroundColor: 'rgba(96, 165, 250, 0.9)',
                        },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ width: columnWidths.description, minWidth: columnWidths.description, maxWidth: columnWidths.description }}>
                  <Box sx={{ position: 'relative', pr: 2 }}>
                    {t('table.description')}
                    <Box
                      onMouseDown={startResize('description')}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 8,
                        height: '100%',
                        cursor: 'col-resize',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '""',
                          width: '1px',
                          height: '60%',
                          backgroundColor: 'rgba(148, 163, 184, 0.65)',
                        },
                        '&:hover::after': {
                          backgroundColor: 'rgba(96, 165, 250, 0.9)',
                        },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ width: columnWidths.instructor, minWidth: columnWidths.instructor, maxWidth: columnWidths.instructor }}>
                  <Box sx={{ position: 'relative', pr: 2 }}>
                    {t('table.instructor')}
                    <Box
                      onMouseDown={startResize('instructor')}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 8,
                        height: '100%',
                        cursor: 'col-resize',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '""',
                          width: '1px',
                          height: '60%',
                          backgroundColor: 'rgba(148, 163, 184, 0.65)',
                        },
                        '&:hover::after': {
                          backgroundColor: 'rgba(96, 165, 250, 0.9)',
                        },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ width: columnWidths.videos, minWidth: columnWidths.videos, maxWidth: columnWidths.videos }}>
                  {t('table.videos')}
                </TableCell>
                <TableCell align="center" sx={{ width: columnWidths.finalQuiz, minWidth: columnWidths.finalQuiz, maxWidth: columnWidths.finalQuiz }}>
                  {t('table.finalQuiz')}
                </TableCell>
                <TableCell align="center" sx={{ width: columnWidths.published, minWidth: columnWidths.published, maxWidth: columnWidths.published }}>
                  {t('table.published')}
                </TableCell>
                <TableCell align="center" sx={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                  {t('table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, opacity: 0.75 }}>
                    {t('emptyState')}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => router.push(`/Courses/${row.id}/videos`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell align="center" sx={{ minWidth: columnWidths.number }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: columnWidths.course }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: 'rgba(148, 163, 184, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {row.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.imageUrl} alt={row.titleAr} width={46} height={46} style={{ objectFit: 'cover' }} />
                          ) : (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {row.titleAr ? row.titleAr.slice(0, 2) : 'CR'}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {row.titleAr || row.id}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.6 }} noWrap>
                            {row.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: columnWidths.description, maxWidth: columnWidths.description }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
                        {row.descriptionAr || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: columnWidths.instructor }}>{row.instructor}</TableCell>
                    <TableCell align="center" sx={{ minWidth: columnWidths.videos }}>
                      {row.videoCount}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: columnWidths.finalQuiz }}>
                      {row.finalQuizCount}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: columnWidths.published }}>
                      {row.published ? 'true' : 'false'}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: columnWidths.actions }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={row.published}
                          disabled={savingId === row.id}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            void togglePublished(row.id, event.target.checked);
                          }}
                          size="small"
                        />
                        <Tooltip title={t('actions.videos')}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={savingId === row.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(`/Courses/${row.id}/videos`);
                              }}
                            >
                              <OndemandVideoIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={t('actions.finalQuiz')}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={savingId === row.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(`/Courses/${row.id}/final-quiz`);
                              }}
                            >
                              <QuizIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={t('actions.edit')}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={savingId === row.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditOpen(row);
                              }}
                            >
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
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(row.id);
                              }}
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
            label={t('table.course')}
            value={editForm.titleAr}
            onChange={(event) => setEditForm((prev) => ({ ...prev, titleAr: event.target.value }))}
            sx={{ mt: 0.5 }}
            fullWidth
          />
          <TextField
            label={t('table.description')}
            value={editForm.descriptionAr}
            onChange={(event) => setEditForm((prev) => ({ ...prev, descriptionAr: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label={t('table.instructor')}
            value={editForm.instructor}
            onChange={(event) => setEditForm((prev) => ({ ...prev, instructor: event.target.value }))}
            fullWidth
          />
          <TextField
            label={t('imageUrl')}
            value={editForm.imageUrl}
            onChange={(event) => setEditForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            fullWidth
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => editImageInputRef.current?.click()}
              disabled={uploadingEditImage || savingId === editingCourse?.id}
            >
              {uploadingEditImage ? t('uploadingImage') : t('uploadImage')}
            </Button>
            <input
              ref={editImageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleEditImagePicked(event);
              }}
              hidden
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
            <Box
              sx={{
                width: 140,
                height: 90,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editForm.imageUrl && !editPreviewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editForm.imageUrl}
                  alt={editForm.titleAr || 'course image preview'}
                  width={140}
                  height={90}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setEditPreviewError(true)}
                />
              ) : (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {t('noImagePreview')}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>{t('actions.cancel')}</Button>
          <Button
            onClick={() => void handleEditSave()}
            variant="contained"
            disabled={!editingCourse || savingId === editingCourse.id || uploadingEditImage}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

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
        <DialogTitle>{t('addCourse')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2.5, overflow: 'visible' }}>
          <TextField
            label={t('table.course')}
            value={createForm.titleAr}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, titleAr: event.target.value }))}
            sx={{ mt: 0.5 }}
            fullWidth
          />
          <TextField
            label={t('table.description')}
            value={createForm.descriptionAr}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, descriptionAr: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label={t('table.instructor')}
            value={createForm.instructor}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, instructor: event.target.value }))}
            fullWidth
          />
          <TextField
            label={t('imageUrl')}
            value={createForm.imageUrl}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            fullWidth
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => createImageInputRef.current?.click()}
              disabled={uploadingCreateImage || creating}
            >
              {uploadingCreateImage ? t('uploadingImage') : t('uploadImage')}
            </Button>
            <input
              ref={createImageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleCreateImagePicked(event);
              }}
              hidden
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
            <Box
              sx={{
                width: 140,
                height: 90,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {createForm.imageUrl && !createPreviewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={createForm.imageUrl}
                  alt={createForm.titleAr || 'course image preview'}
                  width={140}
                  height={90}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setCreatePreviewError(true)}
                />
              ) : (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {t('noImagePreview')}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} disabled={creating}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={() => void handleCreateSave()} variant="contained" disabled={creating || uploadingCreateImage}>
            {t('actions.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <Box
      sx={{
        background: 'var(--surface)',
        color: 'var(--surface-text)',
        borderRadius: 3,
        p: 2,
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}
