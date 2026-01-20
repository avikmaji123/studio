import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Render',
};

// This is an isolated layout that does NOT include the site header or footer.
export default function PdfRenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The certificate page is always dark, so we force the dark theme here.
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* These are critical for Puppeteer to render fonts correctly */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lexend:wght@100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* No providers, no header/footer, just the raw component */}
        {children}
      </body>
    </html>
  );
}
