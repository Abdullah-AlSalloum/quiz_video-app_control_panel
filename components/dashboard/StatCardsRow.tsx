'use client';

import { useEffect, useMemo, useState, type FC } from 'react';
import Box from '@mui/material/Box';
import StatCard from './StatCard';
import SchoolIcon from '@mui/icons-material/School';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import GroupIcon from '@mui/icons-material/Group';
import QuizIcon from '@mui/icons-material/Quiz';
import { useTranslations } from 'next-intl';

type CourseSummary = {
  id: string;
  videoCount: number;
};

type UserSummary = {
  id: string;
  videoQuizzes: number;
  finalQuizzes: number;
};

const StatCardsRow: FC = () => {
  const t = useTranslations('StatCardsRow');
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          fetch('/api/courses', { cache: 'no-store' }),
          fetch('/api/users', { cache: 'no-store' }),
        ]);
        const coursesData = coursesResponse.ok
          ? ((await coursesResponse.json()) as { courses?: CourseSummary[] })
          : { courses: [] };
        const usersData = usersResponse.ok
          ? ((await usersResponse.json()) as { users?: UserSummary[] })
          : { users: [] };

        setCourses(coursesData.courses ?? []);
        setUsers(usersData.users ?? []);
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  const totals = useMemo(() => {
    const totalCourses = courses.length;
    const totalVideos = courses.reduce((sum, course) => sum + (course.videoCount ?? 0), 0);
    const totalUsers = users.length;
    const totalQuizzes = users.reduce(
      (sum, user) => sum + (user.videoQuizzes ?? 0) + (user.finalQuizzes ?? 0),
      0,
    );
    return { totalCourses, totalVideos, totalUsers, totalQuizzes };
  }, [courses, users]);

  const display = loading
    ? { totalCourses: '—', totalVideos: '—', totalUsers: '—', totalQuizzes: '—' }
    : {
        totalCourses: String(totals.totalCourses),
        totalVideos: String(totals.totalVideos),
        totalUsers: String(totals.totalUsers),
        totalQuizzes: String(totals.totalQuizzes),
      };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#22c55e',
              color: '#fff',
            }}
          >
            <SchoolIcon />
          </Box>
        }
        value={display.totalCourses}
        label={t('totalCourses')}
        change="-"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f59e0b',
              color: '#fff',
            }}
          >
            <OndemandVideoIcon />
          </Box>
        }
        value={display.totalVideos}
        label={t('totalVideos')}
        change="-"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#7c3aed',
              color: '#fff',
            }}
          >
            <GroupIcon />
          </Box>
        }
        value={display.totalUsers}
        label={t('totalUsers')}
        change="-"
        trend="up"
      />
      <StatCard
        icon={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0ea5e9',
              color: '#fff',
            }}
          >
            <QuizIcon />
          </Box>
        }
        value={display.totalQuizzes}
        label={t('totalQuizzes')}
        change="-"
        trend="up"
      />
    </Box>
  );
};

export default StatCardsRow;
