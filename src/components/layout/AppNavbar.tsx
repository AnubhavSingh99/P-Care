
"use client";

import React from 'react';
import { UserButton, useAuth } from '@clerk/nextjs'; // Using Clerk's UserButton and useAuth
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
// Removed Select components as role switching is not handled here with Clerk by default

interface AppNavbarProps {
  onMobileMenuToggle: () => void;
}

export function AppNavbar({ onMobileMenuToggle }: AppNavbarProps) {
  const { isSignedIn } = useAuth(); // Get isSignedIn state from Clerk

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {isSignedIn && (
          <UserButton afterSignOutUrl="/auth/login" />
        )}
        {/* If user is not signed in, UserButton won't render.
            Middleware will redirect to login, so no explicit Login button needed here generally.
            If you want a manual login button on some public but complex page, it could be added.
        */}
      </div>
    </header>
  );
}
