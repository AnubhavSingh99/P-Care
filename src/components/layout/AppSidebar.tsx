// src/components/layout/AppSidebar.tsx
"use client";

import React, { useState } from 'react';
import { AppLogo } from '@/components/AppLogo';
import { navMenuItems } from '@/config/site';
import { NavItem } from '@/components/layout/NavItem';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types'; // UserRole type is still useful
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


interface AppSidebarProps {
  isMobile?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isMobile = false }: AppSidebarProps) {
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push('/auth/login');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ title: "Sign Out Failed", description: "Could not sign you out. Please try again.", variant: "destructive" });
    }
  };

  // Role is now part of the extended User type in FirebaseAuthContext
  const userRole = user?.role;

  const accessibleNavItems = navMenuItems.filter(item => {
    if (isAuthLoading) return false; // Don't render items until user data is loaded
    if (!item.roles) return true; // Item has no role restrictions
    // If user has a role, check if it's included in item.roles
    // If user role is not yet defined (e.g., Firestore fetch pending/failed), restrict access
    return userRole ? item.roles.includes(userRole) : false; 
  });

  if (isAuthLoading) {
    return (
      <aside 
        className={cn(
          "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("flex items-center p-4 border-b border-sidebar-border", isCollapsed ? "justify-center" : "")}>
          {isCollapsed ? <Skeleton className="h-7 w-7 rounded-md" /> : <Skeleton className="h-7 w-32 rounded-md" />}
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("flex items-center gap-3 rounded-md p-2", isCollapsed ? "justify-center" : "px-3")}>
              <Skeleton className="h-5 w-5 rounded-md" />
              {!isCollapsed && <Skeleton className="h-5 w-3/4 rounded-md" />}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
          "flex items-center p-4 border-b border-sidebar-border",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && <AppLogo />}
        {isCollapsed && <AppLogo iconOnly />}
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-hover-background">
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {accessibleNavItems.map((item) => (
          <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
        ))}
        {!userRole && !isAuthLoading && (
            <div className="p-2 text-xs text-muted-foreground">
                {isCollapsed ? "..." : "User role not defined. Some items may be hidden."}
            </div>
        )}
      </nav>
      
      <Separator className="my-2 bg-sidebar-border" />
       <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-hover-background hover:text-sidebar-hover-foreground",
            isCollapsed && "justify-center"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
          {isCollapsed && <span className="sr-only">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
