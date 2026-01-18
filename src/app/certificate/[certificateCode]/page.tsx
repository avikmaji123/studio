'use client';

import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { BookOpen, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

function CertificateDisplay({ certificate }: { certificate: Certificate }) {
    return (
        <div className="relative w-full max-w-[1123px] aspect-[1.414] bg-gradient-to-b from-gray-900 to-gray-800 text-white p-12 flex flex-col shadow-2xl overflow-hidden print:w-[29.7cm] print:h-[21cm]">
            {/* Watermark & BG Pattern */}
            <div className="absolute inset-0 z-0">
                 <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] text-white/5 opacity-60 rotate-[-15deg]" />
            </div>

            <div className="relative z-10 flex flex-col items-center flex-grow text-center">
                {/* Header */}
                <header className="w-full mb-10">
                    <div className="flex justify-center items-center gap-3">
                        <BookOpen className="h-8 w-8 text-cyan-400" />
                        <h1 className="text-2xl font-bold tracking-wider">CourseVerse</h1>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex flex-col justify-center items-center w-full">
                    <p className="font-headline text-5xl tracking-tight text-gray-300 mb-6">Certificate of Completion</p>
                    <p className="text-lg text-gray-400 mb-4">This certifies that</p>
                    <p className="font-headline text-6xl font-bold tracking-wider text-white mb-4">{certificate.studentName}</p>
                    <p className="text-lg text-gray-400 mb-4">has successfully completed the</p>
                    <p className="font-headline text-3xl font-semibold text-cyan-400 mb-2">{certificate.courseName}</p>
                    <p className="text-base font-semibold uppercase tracking-widest text-gray-500 mb-8">{certificate.courseLevel || ''}</p>

                    <p className="max-w-xl text-gray-300 mb-12">
                        Congratulations on successfully completing the course. This achievement demonstrates your commitment to professional development.
                    </p>
                </main>
                 
                {/* Details & Signature */}
                <footer className="w-full mt-auto">
                    <div className="flex justify-between items-end">
                        <div className="text-left text-sm">
                            <div className="mb-3">
                                <p className="font-bold text-gray-400">Issue Date</p>
                                <p className="text-gray-200">{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-400">Certificate ID</p>
                                <p className="font-mono text-xs text-gray-300">{certificate.certificateCode}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-signature text-5xl text-gray-100">Avik Maji</p>
                            <hr className="my-1 border-gray-600 w-48 mx-auto"/>
                            <p className="text-sm text-gray-400">Founder, CourseVerse</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function InvalidCertificate({ title, message }: { title: string, message: string }) {
    return (
        <div className="w-full max-w-[1123px] aspect-[1.414] bg-background text-foreground p-12 flex flex-col items-center justify-center text-center shadow-2xl print:w-[29.7cm] print:h-[21cm]">
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

    if (status === 'loading') {
      return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    const renderContent = () => {
      switch (status) {
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
            <div className="no-print mb-8 w-full max-w-4xl flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
                <h2 className="text-lg font-semibold">Certificate Preview</h2>
                 <Button onClick={handlePrint}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PDF
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}
