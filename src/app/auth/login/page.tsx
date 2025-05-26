import { FirebaseLoginForm } from '@/components/auth/FirebaseLoginForm'; // Updated form
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Login - ${siteConfig.name}`,
  description: `Login to ${siteConfig.name} to manage patient records.`,
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <FirebaseLoginForm />
    </div>
  );
}
