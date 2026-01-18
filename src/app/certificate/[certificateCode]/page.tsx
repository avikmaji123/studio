'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { Loader2, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { CertificateDisplay } from '@/components/app/certificate-display';
import { createLogEntry } from '@/lib/actions';

export default function CertificatePage() {
    const params = useParams();
    const code = params.certificateCode as string;
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'revoked'>('loading');
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

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
                setQrCodeUrl(`${window.location.origin}/verify-certificate?code=${data.certificateCode}`);
            } else {
                setStatus('invalid');
                notFound();
            }
        } catch (error) {
            console.error("Error fetching certificate:", error);
            setStatus('invalid');
        }
    }, [firestore, code]);

    useEffect(() => {
        fetchCertificate();
    }, [fetchCertificate]);

    const handleDownload = async () => {
        if (!certificate) return;

        setIsDownloading(true);
        toast({ title: 'Generating PDF...', description: 'Your download will begin shortly.' });

        await createLogEntry({
            source: 'user',
            severity: 'info',
            message: 'Certificate download initiated.',
            metadata: { userId: user?.uid, certificateCode: certificate.certificateCode },
        });

        try {
            const response = await fetch(`/api/certificate/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateCode: certificate.certificateCode }),
            });

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

        } catch (error: any) {
            console.error("PDF Download Error:", error);
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: error.message || 'An unexpected error occurred while generating the PDF.',
            });
            await createLogEntry({
                source: 'system',
                severity: 'critical',
                message: 'Certificate PDF generation failed.',
                metadata: { userId: user?.uid, certificateCode: certificate.certificateCode, error: error.message },
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading Certificate...</p>
                    </div>
                );
            case 'valid':
                return certificate && qrCodeUrl && (
                    <div className="certificate-preview-wrapper">
                      <CertificateDisplay certificate={certificate} qrCodeUrl={qrCodeUrl} />
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
                                ? 'This certificate has been revoked and is no longer valid.'
                                : 'The certificate code could not be found. Please check the code and try again.'}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8 sm:py-16">
                 <div className="max-w-5xl mx-auto">
                    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-center sm:text-left">Certificate Preview</h1>
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
