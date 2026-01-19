import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Certificate | CourseVerse',
  description: 'View your course completion certificate.',
};

// This is an isolated layout that does NOT include the site header or footer.
export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The certificate page is always dark, so we force the dark theme here.
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* Added from root layout to ensure fonts are available for PDF generation */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lexend:wght@100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <FirebaseClientProvider>
            {children}
            <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
