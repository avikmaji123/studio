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
    <div className="bg-slate-900">
        <FirebaseClientProvider>
            {children}
            <Toaster />
        </FirebaseClientProvider>
    </div>
  );
}
