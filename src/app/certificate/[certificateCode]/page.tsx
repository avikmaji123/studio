'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Simplified display, no QR, no print logic
function CertificateDisplay({ certificate }: { certificate: Certificate }) {
    return (
        <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-slate-800 text-gray-100 border-slate-700 shadow-2xl">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-3">
                    <BookOpen className="h-8 w-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider font-headline">CourseVerse</h1>
                </div>
                <hr className="w-48 mx-auto my-3 border-cyan-400/20" />
            </CardHeader>
            <CardContent className="text-center space-y-4 py-8">
                <p className="font-headline text-3xl md:text-4xl tracking-tight text-gray-200">Certificate of Completion</p>
                <p className="text-lg text-gray-400">This is to certify that</p>
                <p className="font-headline text-4xl md:text-5xl font-bold tracking-wider text-white">{certificate.studentName}</p>
                <p className="text-lg text-gray-400">has successfully completed the course</p>
                <p className="font-headline text-2xl md:text-3xl font-semibold text-cyan-400">{certificate.courseName}</p>
                {certificate.courseLevel && <p className="text-base font-semibold uppercase tracking-widest text-gray-500 mt-1">{certificate.courseLevel}</p>}
            </CardContent>
            <CardFooter className="flex justify-between items-end p-6 bg-black/20">
                <div className="text-left text-xs font-mono">
                    <p className="font-sans font-bold text-gray-400">ISSUE DATE</p>
                    <p className="text-gray-300">{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                    <p className="font-sans font-bold text-gray-400 mt-2">CERTIFICATE ID</p>
                    <p className="text-gray-300">{certificate.certificateCode}</p>
                </div>
                <div className="text-center">
                  <p className="font-headline text-xl">Avik Maji</p>
                  <hr className="w-full my-1 border-gray-600"/>
                  <p className="text-xs opacity-75">Founder, CourseVerse</p>
                </div>
            </CardFooter>
        </Card>
    );
}

function InvalidCertificate({ title, message }: { title: string, message: string }) {
    return (
        <div className="text-center py-20">
            <AlertTriangle className="h-24 w-24 text-destructive mx-auto mb-8" />
            <h1 className="font-headline text-5xl font-bold text-destructive">{title}</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">{message}</p>
            <Button asChild className="mt-8">
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
        setStatus('loading');
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


    const renderContent = () => {
      switch (status) {
        case 'loading':
            return (
                <div className="flex items-center justify-center py-20">
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
        <div className="container mx-auto px-4 py-16 sm:py-24">
            {renderContent()}
        </div>
    );
}
