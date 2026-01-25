import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/app/header';
import Footer from '@/components/app/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import MainSiteLayout from '@/components/app/main-site-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://courseverse-app.com'),
  title: {
    default: 'CourseVerse',
    template: `%s | CourseVerse`,
  },
  description: 'Your universe for high-quality licensed courses.',
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F7FB' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lexend:wght@100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="app-root">
          <FirebaseClientProvider>
            <MainSiteLayout>{children}</MainSiteLayout>
            <Toaster />
          </FirebaseClientProvider>
        </div>
        <div id="print-root"></div>
      </body>
    </html>
  );
}
