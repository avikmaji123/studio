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
      <body>
        <FirebaseClientProvider>
            {children}
            <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
