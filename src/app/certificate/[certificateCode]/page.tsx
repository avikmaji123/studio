import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { getSdks } from '@/firebase/index.server';
import type { Certificate } from '@/lib/types';
import Image from 'next/image';
import { BookOpen, Download, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getCertificate(code: string): Promise<Certificate | null> {
    const { firestore } = getSdks();
    const certRef = collection(firestore, 'certificates');
    const q = query(certRef, where('certificateCode', '==', code), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
        return null;
        }
        
        const certDoc = querySnapshot.docs[0];
        // The document ID is the certificateCode, but we also have it in the data
        return certDoc.data() as Certificate;
    } catch (error) {
        console.error("Error fetching certificate:", error);
        return null;
    }
}

function CertificateDisplay({ certificate, verificationUrl }: { certificate: Certificate, verificationUrl: string }) {
    return (
        <div className="relative w-[29.7cm] h-[21cm] bg-background text-foreground p-12 flex flex-col shadow-2xl overflow-hidden bg-gradient-to-br from-background to-muted/30">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <BookOpen className="h-96 w-96 text-foreground/5 opacity-50 rotate-[-30deg]" />
            </div>
            
            <div className="relative z-10 flex flex-col flex-grow">
                {/* Header */}
                <header className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">CourseVerse</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Your universe for high-quality licensed courses.</p>
                </header>

                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    {/* Title */}
                    <p className="text-lg text-muted-foreground">This is to certify that</p>
                    <h2 className="font-headline text-5xl font-bold my-4 tracking-wider">{certificate.studentName}</h2>
                    <p className="text-lg text-muted-foreground">has successfully completed the course</p>
                    <h3 className="text-3xl font-semibold text-primary my-4 underline decoration-accent decoration-2 underline-offset-4">{certificate.courseName}</h3>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground mb-16">
                    <div>
                        <p className="font-bold text-foreground">Issue Date</p>
                        <p>{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                        <p className="font-bold text-foreground">Certificate ID</p>
                        <p className="font-mono text-xs">{certificate.certificateCode}</p>
                    </div>
                     <div>
                        <p className="font-bold text-foreground">Verification URL</p>
                        <p className="font-mono text-xs">{verificationUrl}</p>
                    </div>
                </div>

                {/* Signature */}
                <div className="flex justify-end items-end">
                    <div className="text-center">
                        <p className="font-signature text-4xl">Avik Maji</p>
                        <hr className="my-1 border-foreground/50"/>
                        <p className="text-sm text-muted-foreground">Founder, CourseVerse</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
             <footer className="relative z-10 text-center text-xs text-muted-foreground pt-4">
                <p>This certificate can be verified at {verificationUrl}</p>
            </footer>
        </div>
    );
}

function InvalidCertificate({ title, message }: { title: string, message: string }) {
    return (
        <div className="w-[29.7cm] h-[21cm] bg-background text-foreground p-12 flex flex-col items-center justify-center text-center shadow-2xl">
            <AlertTriangle className="h-24 w-24 text-destructive mb-8" />
            <h1 className="font-headline text-5xl font-bold text-destructive">{title}</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">{message}</p>
            <Button asChild className="mt-8">
                <Link href="/verify-certificate">Try Again</Link>
            </Button>
        </div>
    );
}


export default async function CertificatePage({ params }: { params: { certificateCode: string } }) {
    const code = params.certificateCode;
    const certificate = await getCertificate(code);
    const verificationUrl = `courseverse.in/verify-certificate`; // Use your actual domain

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center py-12 px-4 font-body">
            <div className="no-print mb-8 w-full max-w-4xl flex justify-between items-center">
                <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
                <h2 className="text-lg font-semibold">Certificate Preview</h2>
                <Button onClick={() => 'window.print()'}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PDF
                </Button>
            </div>
            
            {!certificate ? (
                 <InvalidCertificate 
                    title="Invalid Certificate"
                    message="The certificate code you are looking for does not exist. Please check the code and try again."
                />
            ) : certificate.status === 'revoked' ? (
                <InvalidCertificate 
                    title="Certificate Revoked"
                    message="This certificate has been revoked by the administrator and is no longer valid."
                />
            ) : (
                <CertificateDisplay certificate={certificate} verificationUrl={verificationUrl} />
            )}
        </div>
    );
}
