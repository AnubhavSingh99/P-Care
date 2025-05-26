// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs'; // Using Clerk's useAuth
import { Skeleton } from "@/components/ui/skeleton"; 

export default function HomePage() {
  const { userId, isLoaded } = useAuth(); // Get userId and isLoaded from Clerk
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (userId) { // If userId exists, user is authenticated
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [userId, isLoaded, router]);

  // Show a loading state while Clerk checks auth status
  if (!isLoaded) {
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

  // If isLoaded is true, the redirect would have happened. 
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
