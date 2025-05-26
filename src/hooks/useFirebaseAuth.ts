// src/hooks/useFirebaseAuth.ts
"use client";

import { useContext } from 'react';
import { FirebaseAuthContext } from '@/components/auth/FirebaseAuthProvider';

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
