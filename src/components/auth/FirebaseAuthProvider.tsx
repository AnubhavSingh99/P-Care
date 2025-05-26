// src/components/auth/FirebaseAuthProvider.tsx
"use client";

import React, { createContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { User, UserRole } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface FirebaseAuthContextType {
  user: User | null;
  rawFirebaseUser: FirebaseUser | null;
  isLoading: boolean;
  // login, signup, logout will be part of forms or components directly using firebase.auth
}

export const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [rawFirebaseUser, setRawFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setRawFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // User is signed in, try to fetch additional user data (e.g., role) from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...firebaseUser, role: userData.role as UserRole });
          } else {
            // No user document in Firestore, maybe a new signup or data inconsistency
            // For now, set basic user, role needs to be set post-signup
            setUser({ ...firebaseUser, role: undefined }); 
            console.warn("User document not found in Firestore for UID:", firebaseUser.uid);
            // Potentially redirect to a role selection/profile completion page if role is mandatory
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser({ ...firebaseUser, role: undefined }); // Fallback
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect logic
   useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/auth')) {
      router.replace('/auth/login');
    } else if (!isLoading && user && pathname.startsWith('/auth')) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, pathname, router]);


  const contextValue = useMemo(() => ({
    user,
    rawFirebaseUser,
    isLoading,
  }), [user, rawFirebaseUser, isLoading]);

  return (
    <FirebaseAuthContext.Provider value={contextValue}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
