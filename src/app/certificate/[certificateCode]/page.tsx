'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { Loader2, ArrowLeft, Download, ShieldAlert, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CertificateDisplay } from '@/components/app/certificate-display';
import QRCode from 'qrcode';

export default function CertificatePage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const code = params.certificateCode as string;

    const firestore = useFirestore();

    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'revoked'>('loading');
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

    const fetchCertificate = useCallback(async () => {
        if (isUserLoading) {
            return;
        }

        if (!firestore || !code) return;
        
        setStatus('loading');
        
        const certRef = doc(firestore, 'certificates', code);
        try {
            const docSnap = await getDoc(certRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Certificate;
                
                if (data.status === 'valid') {
                  setCertificate(data);
                  setStatus('valid');
                } else if (data.status === 'revoked') {
                   setCertificate(data);
                   setStatus('revoked');
                } else {
                   setStatus('invalid');
                }
                
                if (typeof window !== 'undefined') {
                    const verificationUrl = `${window.location.origin}/verify-certificate?code=${data.certificateCode}`;
                    const qrUrl = await QRCode.toDataURL(verificationUrl, {
                        errorCorrectionLevel: 'H',
                        margin: 1,
                        scale: 4,
                        color: {
                          dark: '#FFFFFF', // QR code dots
                          light: '#00000000', // Transparent background
                        },
                    });
                    setQrCodeDataUrl(qrUrl);
                }
            } else {
                setStatus('invalid');
            }
        } catch (error) {
            console.error("Error fetching certificate:", error);
            setStatus('invalid');
        }
    }, [firestore, code, user, router, isUserLoading]);

    useEffect(() => {
        if (!isUserLoading) {
            fetchCertificate();
        }
    }, [isUserLoading, fetchCertificate]);

    const handlePrint = () => {
        window.print();
    };
    
    if (isUserLoading || status === 'loading') {
        return (
            <div className="certificate-page">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (status === 'invalid' || status === 'revoked' || !certificate) {
        return (
             <div className="certificate-page flex-col">
                <ShieldAlert className="h-24 w-24 text-destructive mx-auto mb-8" />
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-destructive text-center">Certificate Invalid</h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto text-center">
                    {status === 'revoked' 
                        ? 'This certificate has been revoked by the administrator and is no longer valid.'
                        : 'The certificate code could not be found or you do not have permission to view it.'}
                </p>
                 <Button asChild variant="secondary" className="mt-8">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Dashboard
                    </Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="certificate-page">
             <div className="no-print fixed top-4 left-4 z-50">
                <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white border-white/20">
                    <Link href="/dashboard/courses">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>
             <div className="no-print fixed top-4 right-4 z-50">
                <Button
                    onClick={handlePrint}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Save as PDF
                </Button>
            </div>

            <div className="certificate-canvas">
                <CertificateDisplay certificate={certificate} qrCodeDataUrl={qrCodeDataUrl} />
            </div>
        </div>
    );
}
