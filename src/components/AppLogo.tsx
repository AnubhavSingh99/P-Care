import type { SVGProps } from 'react';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react'; // Using Stethoscope as a relevant icon
import { siteConfig } from '@/config/site';

interface AppLogoProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  iconOnly?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function AppLogo({ iconOnly = false, className, iconClassName, textClassName, ...props }: AppLogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-2", className)} aria-label="PatientCare Central Home">
      <Stethoscope
        className={cn("h-7 w-7 text-primary", iconClassName)}
        aria-hidden="true"
        {...props}
      />
      {!iconOnly && (
        <span className={cn("text-xl font-bold text-foreground", textClassName)}>
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
