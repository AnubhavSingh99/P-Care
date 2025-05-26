// src/components/layout/AppNavbar.tsx
"use client";

import React from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AppNavbarProps {
  onMobileMenuToggle: () => void;
}

export function AppNavbar({ onMobileMenuToggle }: AppNavbarProps) {
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push('/auth/login'); // Auth provider will also handle redirect
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ title: "Sign Out Failed", description: "Could not sign you out. Please try again.", variant: "destructive" });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

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
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'}  data-ai-hint="avatar person" />
                  <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile (Coming Soon)
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
