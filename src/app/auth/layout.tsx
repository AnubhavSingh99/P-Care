import { AppLogo } from '@/components/AppLogo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <AppLogo iconClassName="h-10 w-10" textClassName="text-3xl" />
      </div>
      {children}
    </div>
  );
}
