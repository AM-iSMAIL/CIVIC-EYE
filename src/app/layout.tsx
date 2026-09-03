import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RootShell } from '@/components/common/RootShell';
import { siteConfig } from '@/config/site';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CivicEye',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'Civic Issue Reporting',
    'AI City Intelligence',
    'Google Gemini',
    'Google Maps',
    'Pothole Detection',
    'Urban Maintenance',
  ],
  authors: [{ name: 'CivicEye Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#fbfcfd] text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-700">
        <AuthProvider>
          <RootShell>{children}</RootShell>
        </AuthProvider>
      </body>
    </html>
  );
}

