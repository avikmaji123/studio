
import type { Metadata } from 'next';
import '../globals.css'; // Adjust path for nested layout
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Certificate | CourseVerse',
  description: 'Your certificate of completion.',
};

/**
 * This is a dedicated layout for the certificate page.
 * It intentionally omits the Header and Footer to create a clean, isolated
 * environment for both viewing and printing the certificate.
 */
export default function CertificateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The QR code script is needed for this isolated layout */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      </head>
      <body>
        <div id="app-root">
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </div>
        {/* This container is outside the main app root and is used exclusively for printing. */}
        <div id="print-root">
          <div id="certificate-print"></div>
        </div>
      </body>
    </html>
  );
}
