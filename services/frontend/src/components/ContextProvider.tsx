'use client';

import { FC, PropsWithChildren } from 'react';
import AuthProvider from '@/auth/authContext';

const ContextProvider: FC<PropsWithChildren> = ({ children = null }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default ContextProvider;
