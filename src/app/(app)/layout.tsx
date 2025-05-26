// src/app/(app)/layout.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // SheetTrigger won't be used directly here.
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect, but as a fallback:
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
        {/* SheetTrigger is handled by the Menu button in AppNavbar */}
        <SheetContent side="left" className="w-64 p-0 border-r-0"> {/* Remove padding and border for full custom sidebar */}
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
