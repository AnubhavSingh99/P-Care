// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a loading state while checking auth status
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
       <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-primary/20" />
          <Skeleton className="h-4 w-48 bg-primary/20" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
    </div>
  );
}
