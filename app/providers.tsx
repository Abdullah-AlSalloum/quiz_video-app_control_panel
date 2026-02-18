'use client';

import type { FC, ReactNode } from 'react';
import ThemeProvider from '../components/ThemeProvider';

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

export default Providers;
