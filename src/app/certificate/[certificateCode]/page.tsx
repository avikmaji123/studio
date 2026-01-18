'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { BookOpen, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// New Landscape Certificate Layout
function CertificateDisplay({ certificate }: { certificate: Certificate }) {
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-12 flex flex-col justify-between shadow-2xl overflow-hidden font-body">
            {/* Watermark */}
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] text-white/5 opacity-75" />

            {/* Header */}
            <div className="text-center z-10">
                <div className="flex justify-center items-center gap-3">
                    <BookOpen className="h-8 w-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider font-headline">CourseVerse</h1>
                </div>
                 <hr className="w-48 mx-auto my-3 border-cyan-400/20" />
            </div>
            
            {/* Main Content */}
            <div className="text-center z-10 -mt-8">
                <p className="font-headline text-5xl tracking-tight text-gray-200">Certificate of Completion</p>
                <p className="text-lg text-gray-400 mt-6 mb-4">This is to certify that</p>
                <p className="font-headline text-6xl font-bold tracking-wider text-white">{certificate.studentName}</p>
                <p className="text-lg text-gray-400 mt-4">has successfully completed the course</p>
                <p className="font-headline text-3xl font-semibold text-cyan-400 mt-2">{certificate.courseName}</p>
                 {certificate.courseLevel && <p className="text-base font-semibold uppercase tracking-widest text-gray-500 mt-1">{certificate.courseLevel}</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end z-10">
                <div className="text-left text-xs font-mono">
                    <p className="font-sans font-bold text-gray-400">ISSUE DATE</p>
                    <p className="text-gray-300">{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                    <p className="font-sans font-bold text-gray-400 mt-2">CERTIFICATE ID</p>
                    <p className="text-gray-300">{certificate.certificateCode}</p>
                </div>
                <div className="text-center">
                    <p className="font-signature text-5xl text-gray-100 -mb-4">Avik Maji</p>
                    <hr className="my-1 border-gray-600 w-48 mx-auto"/>
                    <p className="text-sm text-gray-400">Founder, CourseVerse</p>
                </div>
            </div>
        </div>
    );
}

function InvalidCertificate({ title, message }: { title: string, message: string }) {
    return (
        <div className="w-full h-full bg-background text-foreground p-12 flex flex-col items-center justify-center text-center shadow-2xl">
            <AlertTriangle className="h-24 w-24 text-destructive mb-8" />
            <h1 className="font-headline text-5xl font-bold text-destructive">{title}</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">{message}</p>
            <Button asChild className="mt-8 no-print">
                <Link href="/verify-certificate">Try Again</Link>
            </Button>
        </div>
    );
}


export default function CertificatePage() {
    const params = useParams();
    const code = params.certificateCode as string;
    const firestore = useFirestore();

    const [status, setStatus] = useState<'loading' | 'valid' | 'revoked' | 'invalid'>('loading');
    const [certificate, setCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
      if (!firestore || !code) return;
      
      const getCertificate = async () => {
        const certRef = doc(firestore, 'certificates', code);
        try {
          const docSnap = await getDoc(certRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Certificate;
            setCertificate(data);
            setStatus(data.status === 'revoked' ? 'revoked' : 'valid');
          } else {
            setStatus('invalid');
          }
        } catch (error) {
          console.error("Error fetching certificate:", error);
          setStatus('invalid');
        }
      };

      getCertificate();
    }, [firestore, code]);

    const handlePrint = () => {
        window.print();
    };

    const renderContent = () => {
      switch (status) {
        case 'loading':
            return (
                <div className="w-full h-full bg-background text-foreground p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            );
        case 'valid':
          return certificate && <CertificateDisplay certificate={certificate} />;
        case 'revoked':
          return <InvalidCertificate title="Certificate Revoked" message="This certificate has been revoked by the administrator and is no longer valid." />;
        case 'invalid':
        default:
          return <InvalidCertificate title="Invalid Certificate" message="The certificate code you are looking for does not exist. Please check the code and try again." />;
      }
    };

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center py-12 px-4 font-body">
            <div className="no-print mb-8 w-full max-w-5xl flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
                <h2 className="text-lg font-semibold">Certificate Preview</h2>
                 <Button onClick={handlePrint}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PDF
                </Button>
            </div>
            
            {/* This new wrapper structure is critical for correct printing and preview */}
            <div id="print-wrapper">
                <div id="certificate-print-root">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
