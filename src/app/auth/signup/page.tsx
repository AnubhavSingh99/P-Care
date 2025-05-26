import { FirebaseSignupForm } from '@/components/auth/FirebaseSignupForm'; // Updated form
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Sign Up - ${siteConfig.name}`,
  description: `Create an account for ${siteConfig.name}.`,
};

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <FirebaseSignupForm />
    </div>
  );
}
