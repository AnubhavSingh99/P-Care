// src/app/(app)/layout.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'; // Using Firebase Auth
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useFirebaseAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // FirebaseAuthProvider handles primary redirection.
  // This useEffect is a fallback or for scenarios where client-side redirect might be desired
  // immediately after Firebase auth loads, though the provider should generally cover this.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full bg-primary/20" />
          <Skeleton className="h-4 w-48 bg-primary/20" />
          <p className="text-muted-foreground">Loading PatientCare Central...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect in useEffect or provider,
    // but as a fallback:
    return null; 
  }
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 border-r-0">
          <AppSidebar isMobile={true} onToggle={toggleMobileMenu} />
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppNavbar onMobileMenuToggle={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
