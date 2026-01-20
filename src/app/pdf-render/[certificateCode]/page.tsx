
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { getSdks } from '@/firebase/index.server';
import type { Certificate } from '@/lib/types';
import { CertificateDisplay } from '@/components/app/certificate-display';
import QRCode from 'qrcode';

// A server-only utility to fetch certificate data
async function getCertificate(code: string): Promise<Certificate | null> {
    const { firestore } = getSdks();
    const certRef = doc(firestore, 'certificates', code);
    const docSnap = await getDoc(certRef);
    return docSnap.exists() ? (docSnap.data() as Certificate) : null;
}

// This is a minimal, server-only layout for PDF rendering
function PdfRenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lexend:wght@100..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; }
          #certificate-container {
            width: 1123px;
            height: 794px;
            position: absolute;
            top: 0;
            left: 0;
          }
        `}} />
      </head>
      <body>
        <div id="certificate-container">{children}</div>
      </body>
    </html>
  );
}

export default async function PdfRenderPage({ params }: { params: { certificateCode: string } }) {
    const code = params.certificateCode;
    const certificate = await getCertificate(code);

    if (!certificate) {
        notFound();
    }
    
    // Generate QR code on the server
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/verify-certificate?code=${certificate.certificateCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 4,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    return (
        <PdfRenderLayout>
            <CertificateDisplay certificate={certificate} qrCodeDataUrl={qrCodeDataUrl} />
        </PdfRenderLayout>
    );
}

