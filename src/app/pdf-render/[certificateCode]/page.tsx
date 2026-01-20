import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server';
import type { Certificate } from '@/lib/types';
import { CertificateDisplay } from '@/components/app/certificate-display';

// This is the same icon SVG from the original client page.
const bookOpenLogoSvg = btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>');

// This is a pure server component for rendering the certificate for PDF capture.
export default async function PdfRenderPage({ params }: { params: { certificateCode: string } }) {
    const { certificateCode } = params;
    
    // 1. Fetch certificate data server-side
    const { firestore } = getSdks();
    const certRef = doc(firestore, 'certificates', certificateCode);
    const docSnap = await getDoc(certRef);

    if (!docSnap.exists()) {
        notFound();
    }
    const certificate = docSnap.data() as Certificate;
    if (certificate.status === 'revoked') {
         return <div>Certificate has been revoked.</div>
    }

    // 2. Construct the full URL for the QR code
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const qrCodeUrl = `${protocol}://${host}/verify-certificate?code=${certificate.certificateCode}`;

    // 3. Render the exact same component used in the preview
    return (
         <CertificateDisplay 
            certificate={certificate} 
            qrCodeUrl={qrCodeUrl} 
            qrLogoSvg={bookOpenLogoSvg} 
        />
    );
}
