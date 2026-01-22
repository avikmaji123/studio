import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate | CourseVerse',
  description: 'View your course completion certificate.',
  robots: {
    index: false,
    follow: false,
  }
};

// This is an isolated layout. The root layout conditionally renders the site header and footer.
export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The certificate page is always dark, so we force the dark theme here.
    // The root layout's providers (Firebase, Toaster) will still apply to the children.
    <div className="dark" style={{ colorScheme: 'dark' }}>
      {children}
    </div>
  );
}
