"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, UserCircle, Settings, LogOut } from 'lucide-react';
import type { UserRole } from '@/types';
import { defaultUserRole } from '@/config/site';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppNavbarProps {
  onMobileMenuToggle: () => void;
}

export function AppNavbar({ onMobileMenuToggle }: AppNavbarProps) {
  const { user, logout, setUserRole, isLoading } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'P'; // PatientCare
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
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
        {/* Placeholder for page title or breadcrumbs if needed */}
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher for Demo */}
        {user && !isLoading && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Select value={user.role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
              <SelectTrigger className="h-9 w-[120px] text-sm">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100/64B5F6/FFFFFF?text=${getInitials(user.name)}`} alt={user.name || 'User'} data-ai-hint="avatar person" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || user.email?.split('@')[0]}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline">
            <Link href="/auth/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
