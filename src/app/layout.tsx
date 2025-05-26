import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Assuming Geist is locally configured as per initial files
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/config/site';

const geistSans = Geist({ // If Geist is local, this might need to be Inter or similar from next/font/google
  variable: '--font-geist-sans',
  subsets: ['latin'], // Ensure subsets if using Google Fonts, or adjust if local
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'], // Ensure subsets
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { // Example, replace with actual icons if available
    icon: '/favicon.ico', 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
