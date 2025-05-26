import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Assuming Geist is locally configured as per initial files
import './globals.css';
// Removed AuthProvider, will use ClerkProvider
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/config/site';
import { ClerkProvider } from '@clerk/nextjs';

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
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
          {/* AuthProvider removed, ClerkProvider is now at the top level */}
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
