"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem as NavItemType } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
}

export function NavItem({ item, isCollapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  const linkContent = (
    <>
      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-sidebar-active-foreground" : "text-sidebar-foreground group-hover:text-sidebar-hover-foreground")} />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </>
  );

  const linkClasses = cn(
    "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors group",
    "text-sidebar-foreground hover:bg-sidebar-hover-background hover:text-sidebar-hover-foreground",
    isActive && "bg-sidebar-active-background text-sidebar-active-foreground",
    isCollapsed ? "justify-center" : "px-3",
    item.disabled && "cursor-not-allowed opacity-50"
  );

  if (item.disabled) {
    return (
      <div className={linkClasses} aria-disabled="true">
        {linkContent}
      </div>
    );
  }
  
  const linkElement = (
     <Link href={item.href} className={linkClasses}>
        {linkContent}
      </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {linkElement}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkElement;
}
