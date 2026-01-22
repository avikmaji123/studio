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
                
                // Security check: Only the owner or an admin can view a valid certificate.
                if (data.status === 'valid' && user && (data.userId === user.uid || (user as any).profile?.role === 'admin')) {
                  setCertificate(data);
                  setStatus('valid');
                } else if (data.status === 'revoked') {
                   setCertificate(data);
                   setStatus('revoked');
                } else if (!user) {
                   // If not logged in, redirect to verification page which is public
                   router.replace(`/verify-certificate?code=${code}`);
                   return;
                } else {
                   setStatus('invalid'); // Or 'unauthorized'
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
        fetchCertificate();
    }, [fetchCertificate]);

    const handleDownload = () => {
        window.print();
    };
    
    if (isUserLoading || status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-900">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying Certificate...</p>
            </div>
        );
    }

    if (status === 'invalid' || status === 'revoked' || !certificate) {
        return (
             <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
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
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 print:p-0 print:bg-white">
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
                    onClick={handleDownload}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Save as PDF
                </Button>
            </div>

            <div id="certificate-wrapper" className="my-16 md:my-0">
                <CertificateDisplay certificate={certificate} qrCodeDataUrl={qrCodeDataUrl} />
            </div>
        </div>
    );
}
