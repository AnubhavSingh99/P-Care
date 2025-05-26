import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Login - ${siteConfig.name}`,
  description: `Login to ${siteConfig.name} to manage patient records.`,
};

export default function LoginPage() {
  return <LoginForm />;
}
