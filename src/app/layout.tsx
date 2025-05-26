import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/config/site';
import { FirebaseAuthProvider } from '@/components/auth/FirebaseAuthProvider'; // Updated Provider

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'], 
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'], 
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { 
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
        <FirebaseAuthProvider> {/* Use Firebase Auth Provider */}
          {children}
          <Toaster />
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
