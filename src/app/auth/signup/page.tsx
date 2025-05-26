import { SignupForm } from '@/components/auth/SignupForm';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Sign Up - ${siteConfig.name}`,
  description: `Create an account for ${siteConfig.name}.`,
};

export default function SignupPage() {
  return <SignupForm />;
}
