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
import MenuItem from '@mui/material/MenuItem';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type QuestionRow = {
  index: number;
  questionAr: string;
  optionsAr: string[];
  correctAnswerAr: string;
  score: number;
};

type CourseInfo = {
  id: string;
  titleAr: string;
};

const emptyOptions = ['', '', '', ''];

export default function FinalQuizPage() {
  const t = useTranslations('finalQuiz');
  const params = useParams<{ id: string }>();
  const courseId = params?.id ?? '';

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | 'create' | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<QuestionRow | null>(null);
  const [form, setForm] = useState({
    questionAr: '',
    optionsAr: [...emptyOptions],
    correctAnswerAr: '',
    score: 1,
  });

  const headerTitle = useMemo(() => {
    const title = course?.titleAr || courseId || t('courseFallback');
    return t('title', { course: title });
  }, [course?.titleAr, courseId, t]);

  const loadQuestions = useCallback(async () => {
    if (!courseId) return;
    const response = await fetch(`/api/courses/${courseId}/final-quiz`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(t('loadError'));
    }
    const data = (await response.json()) as { course?: CourseInfo; questions?: unknown[] };
    const questions = Array.isArray(data.questions) ? data.questions : [];
    const mapped = questions.map((item, index) => {
      const question = typeof item === 'object' && item ? item : {};
      const questionAr = String((question as { question_ar?: string }).question_ar ?? '').trim();
      const optionsAr = Array.isArray((question as { options_ar?: string[] }).options_ar)
        ? (question as { options_ar: string[] }).options_ar.map((opt) => String(opt ?? '').trim()).filter(Boolean)
        : [];
      const correctAnswerAr = String((question as { correct_answer_ar?: string }).correct_answer_ar ?? '').trim();
      const score = Number((question as { score?: number }).score ?? 0);
      return {
        index,
        questionAr,
        optionsAr,
        correctAnswerAr,
        score,
      };
    });

    setCourse(data.course ?? null);
    setRows(mapped);
  }, [courseId, t]);

  const reloadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadQuestions();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [loadQuestions, t]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  const handleCreateOpen = () => {
    setForm({
      questionAr: '',
      optionsAr: [...emptyOptions],
      correctAnswerAr: '',
      score: 1,
    });
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    if (savingId) return;
    setCreateOpen(false);
  };

  const handleEditOpen = (row: QuestionRow) => {
    setEditingRow(row);
    const options = [...row.optionsAr, ...emptyOptions].slice(0, 4);
    setForm({
      questionAr: row.questionAr,
      optionsAr: options,
      correctAnswerAr: row.correctAnswerAr,
      score: row.score || 1,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    if (savingId) return;
    setEditOpen(false);
    setEditingRow(null);
  };

  const validateForm = () => {
    const questionAr = form.questionAr.trim();
    const optionsAr = form.optionsAr.map((opt) => opt.trim()).filter(Boolean);
    const correctAnswerAr = form.correctAnswerAr.trim();
    const score = Number(form.score);

    if (!questionAr || optionsAr.length < 2) {
      setError(t('validationRequired'));
      return null;
    }
    if (!correctAnswerAr || !optionsAr.includes(correctAnswerAr)) {
      setError(t('validationCorrect'));
      return null;
    }
    if (!Number.isFinite(score) || score <= 0) {
      setError(t('validationScore'));
      return null;
    }

    return { questionAr, optionsAr, correctAnswerAr, score };
  };

  const handleCreateSave = async () => {
    if (!courseId) return;
    const payload = validateForm();
    if (!payload) return;
    setSavingId('create');

    try {
      const response = await fetch(`/api/courses/${courseId}/final-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || t('createError'));
      }
      await loadQuestions();
      setCreateOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('createError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editingRow) return;
    const payload = validateForm();
    if (!payload) return;
    setSavingId(editingRow.index);

    try {
      const response = await fetch(`/api/courses/${courseId}/final-quiz`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: editingRow.index, ...payload }),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || t('updateError'));
      }
      await loadQuestions();
      setEditOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('updateError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (row: QuestionRow) => {
    const confirmDelete = window.confirm(t('deleteConfirm'));
    if (!confirmDelete) return;
    setSavingId(row.index);

    try {
      const response = await fetch(`/api/courses/${courseId}/final-quiz`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: row.index }),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || t('deleteError'));
      }
      await loadQuestions();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t('deleteError'));
    } finally {
      setSavingId(null);
    }
  };

  const optionMenuItems = form.optionsAr.map((option, index) => ({
    value: option.trim(),
    label: option.trim() || t('form.optionPlaceholder', { index: index + 1 }),
    key: `option-${index}`,
  }));

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
            {t('subtitle')}
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
                <TableCell>{t('table.question')}</TableCell>
                <TableCell>{t('table.correct')}</TableCell>
                <TableCell align="center">{t('table.score')}</TableCell>
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
                  <TableRow key={row.index} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.questionAr}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        {row.optionsAr.join(' · ')}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.correctAnswerAr}</TableCell>
                    <TableCell align="center">{row.score}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={t('actions.edit')}>
                          <span>
                            <IconButton size="small" disabled={savingId === row.index} onClick={() => handleEditOpen(row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={t('actions.remove')}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={savingId === row.index}
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
            label={t('form.question')}
            value={form.questionAr}
            onChange={(event) => setForm((prev) => ({ ...prev, questionAr: event.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          {form.optionsAr.map((option, index) => (
            <TextField
              key={`create-option-${index}`}
              label={t('form.option', { index: index + 1 })}
              value={option}
              onChange={(event) =>
                setForm((prev) => {
                  const nextOptions = [...prev.optionsAr];
                  nextOptions[index] = event.target.value;
                  return { ...prev, optionsAr: nextOptions };
                })
              }
              fullWidth
            />
          ))}
          <TextField
            select
            label={t('form.correct')}
            value={form.correctAnswerAr}
            onChange={(event) => setForm((prev) => ({ ...prev, correctAnswerAr: event.target.value }))}
            fullWidth
          >
            {optionMenuItems.map((option) => (
              <MenuItem key={option.key} value={option.value} disabled={!option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('form.score')}
            type="number"
            value={form.score}
            onChange={(event) => setForm((prev) => ({ ...prev, score: Number(event.target.value) }))}
            fullWidth
            inputProps={{ min: 1 }}
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
            label={t('form.question')}
            value={form.questionAr}
            onChange={(event) => setForm((prev) => ({ ...prev, questionAr: event.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          {form.optionsAr.map((option, index) => (
            <TextField
              key={`edit-option-${index}`}
              label={t('form.option', { index: index + 1 })}
              value={option}
              onChange={(event) =>
                setForm((prev) => {
                  const nextOptions = [...prev.optionsAr];
                  nextOptions[index] = event.target.value;
                  return { ...prev, optionsAr: nextOptions };
                })
              }
              fullWidth
            />
          ))}
          <TextField
            select
            label={t('form.correct')}
            value={form.correctAnswerAr}
            onChange={(event) => setForm((prev) => ({ ...prev, correctAnswerAr: event.target.value }))}
            fullWidth
          >
            {optionMenuItems.map((option) => (
              <MenuItem key={option.key} value={option.value} disabled={!option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('form.score')}
            type="number"
            value={form.score}
            onChange={(event) => setForm((prev) => ({ ...prev, score: Number(event.target.value) }))}
            fullWidth
            inputProps={{ min: 1 }}
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
