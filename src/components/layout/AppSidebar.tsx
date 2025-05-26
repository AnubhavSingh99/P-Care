
"use client";

import React, { useState } from 'react';
import { AppLogo } from '@/components/AppLogo';
import { navMenuItems } from '@/config/site';
import { NavItem } from '@/components/layout/NavItem';
import { useUser } from '@clerk/nextjs'; // Using Clerk's useUser
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react'; // LogOut icon removed as UserButton handles it
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types'; // UserRole type is still useful

interface AppSidebarProps {
  isMobile?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isMobile = false }: AppSidebarProps) {
  const { user, isLoaded } = useUser(); // Get user from Clerk
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // User role is expected to be in user.publicMetadata.role
  // You'll need to set this in your Clerk dashboard (Users > select user > Metadata > Public Metadata)
  // Example: { "role": "doctor" }
  const userRole = user?.publicMetadata?.role as UserRole | undefined;

  const accessibleNavItems = navMenuItems.filter(item => {
    if (!isLoaded) return false; // Don't render items until user data is loaded
    if (!item.roles) return true; // Item has no role restrictions
    return userRole ? item.roles.includes(userRole) : false;
  });

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
      </nav>

      {/* Logout button removed, UserButton in AppNavbar handles this */}
      {/* If you still want a logout button here, you'd use Clerk's signOut method */}
      {/* For example:
          import { useClerk } from '@clerk/nextjs';
          const { signOut } = useClerk();
          ...
          <Button onClick={() => signOut({ redirectUrl: '/auth/login' })}>Logout</Button>
      */}
      <Separator className="my-2 bg-sidebar-border opacity-0" /> {/* Kept for spacing, visually hidden if no content below */}
      <div className="p-2 h-12"> {/* Placeholder for consistent height if footer content is removed */}
        {/* Content previously here (logout button) is now handled by UserButton in navbar */}
      </div>
    </aside>
  );
}
