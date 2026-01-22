
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { Loader2, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { CertificateDisplay } from '@/components/app/certificate-display';
import { createLogEntry } from '@/lib/actions';
import QRCode from 'qrcode';

// A simple viewport scaler hook to handle the preview display
function useViewportScaler(elementWidth: number) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        function handleResize() {
            if (typeof window !== 'undefined') {
                // 32px padding on each side for the preview
                const availableWidth = window.innerWidth - 64;
                setScale(Math.min(1, availableWidth / elementWidth));
            }
        }

        handleResize(); // Initial scale
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [elementWidth]);

    return scale;
}

export default function CertificatePage() {
    const params = useParams();
    const code = params.certificateCode as string;

    const firestore = useFirestore();
    const { toast } = useToast();

    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'revoked'>('loading');
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

    const scale = useViewportScaler(1123); // Fixed certificate width

    const fetchCertificate = useCallback(async () => {
        if (!firestore || !code) return;
        setStatus('loading');
        const certRef = doc(firestore, 'certificates', code);
        try {
            const docSnap = await getDoc(certRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Certificate;
                setCertificate(data);
                setStatus(data.status === 'revoked' ? 'revoked' : 'valid');
                
                if (typeof window !== 'undefined') {
                    const verificationUrl = `${window.location.origin}/verify-certificate?code=${data.certificateCode}`;
                    const qrUrl = await QRCode.toDataURL(verificationUrl, {
                        errorCorrectionLevel: 'H',
                        margin: 2,
                        scale: 4,
                        color: {
                          dark: '#0F172A',
                          light: '#FFFFFF',
                        },
                    });
                    setQrCodeDataUrl(qrUrl);
                }
            } else {
                setStatus('invalid');
                notFound();
            }
        } catch (error) {
            console.error("Error fetching certificate:", error);
            setStatus('invalid');
        }
    }, [firestore, code, notFound]);

    useEffect(() => {
        fetchCertificate();
    }, [fetchCertificate]);

    const handleDownload = async () => {
        if (!certificate) return;

        setIsDownloading(true);
        toast({ title: 'Generating PDF...', description: 'Your secure download will begin shortly.' });

        try {
            // This secret MUST match the one in the API route.
            const secret = 'COURSEVERSE_PDF_SECRET_KEY_2024';
            const response = await fetch(`/api/certificate/generate?code=${certificate.certificateCode}&secret=${secret}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CourseVerse_Certificate_${certificate.certificateCode}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            await createLogEntry({
                source: 'user',
                severity: 'info',
                message: 'Certificate PDF downloaded successfully.',
                metadata: { certificateCode: certificate.certificateCode },
            });

        } catch (error: any) {
            console.error("PDF Download Error:", error);
            const errorMessage = error.message || 'An unknown error occurred during PDF generation.';
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: errorMessage,
            });
             await createLogEntry({
                source: 'system',
                severity: 'critical',
                message: 'Server-side PDF generation failed.',
                metadata: { certificateCode: certificate.certificateCode, error: errorMessage },
            });
        } finally {
            setIsDownloading(false);
        }
    };
    
    // For regular user preview
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-muted-foreground">Verifying Certificate...</p>
                    </div>
                );
            case 'valid':
                return certificate && (
                    <div className="my-8 flex justify-center items-center" style={{ minHeight: 794 * scale }}>
                        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                           <CertificateDisplay certificate={certificate} qrCodeDataUrl={qrCodeDataUrl} />
                        </div>
                    </div>
                );
            case 'revoked':
            case 'invalid':
            default:
                return (
                     <div className="text-center py-20">
                        <ShieldAlert className="h-24 w-24 text-destructive mx-auto mb-8" />
                        <h1 className="font-headline text-5xl font-bold text-destructive">Certificate Invalid</h1>
                        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                            {status === 'revoked' 
                                ? 'This certificate has been revoked by the administrator and is no longer valid.'
                                : 'The certificate code could not be found. Please check the code and try again.'}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8 sm:py-12">
                 <div className="mx-auto">
                    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white border-white/20">
                            <Link href="/dashboard/courses">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to My Courses
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-center sm:text-left">Certificate of Completion</h1>
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading || status !== 'valid'}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isDownloading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            {isDownloading ? 'Generating...' : 'Download PDF'}
                        </Button>
                    </header>
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
