// src/app/(app)/layout.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs'; // Using Clerk's useAuth
import { useRouter } from 'next/navigation'; // Keep for potential client-side needs if any
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth(); // Using isLoaded and userId from Clerk
  const router = useRouter(); // Keep router if needed for other purposes
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Middleware primarily handles route protection.
  // This useEffect is a fallback or for scenarios where client-side redirect might be desired
  // immediately after Clerk loads, though middleware should generally cover this.
  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace('/auth/login');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
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

  if (!userId) {
    // This case should ideally be handled by the redirect in useEffect or middleware,
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
