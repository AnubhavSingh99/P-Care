"use client";

import React, { useState } from 'react';
import { AppLogo } from '@/components/AppLogo';
import { navMenuItems } from '@/config/site';
import { NavItem } from '@/components/layout/NavItem';
import { useAuth } from '@/components/auth/useAuth';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  isMobile?: boolean; // For potential mobile-specific behavior, though Sheet handles most
  onToggle?: () => void; // For mobile toggle
}

export function AppSidebar({ isMobile = false }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const accessibleNavItems = navMenuItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

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
        {!isMobile && ( /* Hide desktop toggle button on mobile sheet */
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

      <Separator className="my-2 bg-sidebar-border" />
      
      <div className="p-2">
        {user && (
           <Button 
            variant="ghost" 
            onClick={logout} 
            className={cn(
              "w-full flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-hover-background hover:text-sidebar-hover-foreground",
              isCollapsed ? "justify-center p-2" : "justify-start p-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}
