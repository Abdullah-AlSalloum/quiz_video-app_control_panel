'use client';

import type { FC, ReactNode } from 'react';
import ThemeProvider from '../components/ThemeProvider';
import { AppAuthProvider } from '../components/AuthProvider';
import AuthGuard from '../components/AuthGuard';

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AppAuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AppAuthProvider>
    </ThemeProvider>
  );
};

export default Providers;
