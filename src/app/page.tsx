// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'; // Using Firebase Auth
import { Skeleton } from "@/components/ui/skeleton"; 

export default function HomePage() {
  const { user, isLoading } = useFirebaseAuth(); // Get user and isLoading from Firebase Auth
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) { 
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Show a loading state while Firebase checks auth status
  if (isLoading) {
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

  // If isLoading is false, the redirect would have happened. 
  // This return is mostly a fallback or for the brief moment before redirect.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
       <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-primary/20" />
          <Skeleton className="h-4 w-48 bg-primary/20" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
    </div>
  );
}
