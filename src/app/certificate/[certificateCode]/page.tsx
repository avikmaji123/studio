'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Base64 encoded SVG of the BookOpen icon, with a color that works on the QR code's white background
const bookOpenLogoSvg = btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>');

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
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const certificateRef = useRef<HTMLDivElement>(null);
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
                    // Dynamically generate QR code content based on current domain
                    setQrCodeUrl(`${window.location.origin}/verify-certificate?code=${data.certificateCode}`);
                }
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
        if (!certificateRef.current || !certificate) {
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'Certificate element not found. Please refresh and try again.',
            });
            return;
        }

        setIsDownloading(true);
        toast({ title: 'Generating PDF...', description: 'Your secure download will begin shortly.' });

        try {
            // Using html2canvas to capture the single-source-of-truth DOM node.
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Increase resolution for better PDF quality
                useCORS: true, 
                backgroundColor: null, // Transparent background to capture the component's own styling
            });

            const imgData = canvas.toDataURL('image/png');
            
            // Using jsPDF to create a single-page PDF with the exact dimensions.
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1123, 794], // A4 landscape at ~96 DPI
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
            pdf.save(`CourseVerse_Certificate_${certificate.certificateCode}.pdf`);

            await createLogEntry({
                source: 'user',
                severity: 'info',
                message: 'Certificate PDF downloaded.',
                metadata: { certificateCode: certificate.certificateCode },
            });
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
                metadata: { certificateCode: certificate.certificateCode, error: error.message },
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
                        <p className="text-muted-foreground">Verifying Certificate...</p>
                    </div>
                );
            case 'valid':
                return certificate && qrCodeUrl && (
                    // This is the viewport for the scaled preview. It handles centering.
                    <div className="my-8 flex justify-center items-center" style={{ minHeight: 794 * scale }}>
                        {/* The wrapper applies the visual scale without affecting layout */}
                        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                           <CertificateDisplay ref={certificateRef} certificate={certificate} qrCodeUrl={qrCodeUrl} qrLogoSvg={bookOpenLogoSvg} />
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
        // The background is set on the parent div to avoid it being captured by html2canvas
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
