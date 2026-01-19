import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { getSdks } from '@/firebase/index.server';
import type { Certificate } from '@/lib/types';
import { CertificateDisplay } from '@/components/app/certificate-display';
import { headers } from 'next/headers';

// Base64 encoded SVG of the BookOpen icon
const bookOpenLogoSvg = btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>');

async function getCertificate(code: string): Promise<Certificate | null> {
    const { firestore } = getSdks();
    const certRef = doc(firestore, 'certificates', code);
    const docSnap = await getDoc(certRef);
    if (!docSnap.exists()) return null;
    return docSnap.data() as Certificate;
}

// This is a server component used only for rendering the certificate for Puppeteer
export default async function CertificateRenderPage({ params }: { params: { certificateCode: string } }) {
    const certificate = await getCertificate(params.certificateCode);

    if (!certificate) {
        notFound();
    }
    
    const host = headers().get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const qrCodeUrl = `${protocol}://${host}/verify-certificate?code=${certificate.certificateCode}`;

    // This page has a minimal layout, no <head>, no <body>, just the component
    // because Puppeteer will handle the page creation.
    return (
        <CertificateDisplay certificate={certificate} qrCodeUrl={qrCodeUrl} qrLogoSvg={bookOpenLogoSvg} />
    );
}
