'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, CheckCircle, XCircle, Award, Download, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Certificate } from '@/lib/types';


type VerificationResult = {
    status: 'valid' | 'invalid' | 'revoked';
    data?: Certificate;
} | null;

export default function VerifyCertificatePage() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [certificateCode, setCertificateCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [result, setResult] = useState<VerificationResult>(null);

    const runVerification = useCallback(async (codeToVerify: string) => {
        if (!firestore || !codeToVerify.trim()) return;

        setIsLoading(true);
        setResult(null);
        const code = codeToVerify.trim();

        try {
            const certRef = doc(firestore, 'certificates', code);
            const docSnap = await getDoc(certRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as Certificate;
                if (data.status === 'revoked') {
                     setResult({ status: 'revoked', data });
                } else {
                     setResult({ status: 'valid', data });
                }
            } else {
                setResult({ status: 'invalid' });
            }
        } catch (error) {
            console.error("Certificate verification error:", error);
            setResult({ status: 'invalid' });
        } finally {
            setIsLoading(false);
        }
    }, [firestore]);

    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setCertificateCode(codeFromUrl);
            runVerification(codeFromUrl);
        }
    }, [searchParams, runVerification]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runVerification(certificateCode);
    };

    const handleDownload = async (code: string) => {
        setIsDownloading(true);
        toast({ title: 'Generating PDF...', description: 'Your download will begin shortly.' });

        try {
            const response = await fetch(`/api/certificate/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateCode: code }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CourseVerse_Certificate_${code}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsDownloading(false);
        }
    };


    const VerificationResultCard = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )
        }
        
        if (!result) return null;

        if (result.status === 'invalid') {
            return (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                         <XCircle className="h-10 w-10 text-destructive" />
                         <div>
                            <CardTitle className="text-destructive">Certificate Not Found</CardTitle>
                            <CardDescription className="text-destructive/80">The code you entered is invalid or does not exist. Please check the code and try again.</CardDescription>
                         </div>
                    </CardHeader>
                </Card>
            )
        }

         if (result.status === 'revoked') {
            return (
                <Card className="border-amber-500/50 bg-amber-500/10">
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                         <XCircle className="h-10 w-10 text-amber-600" />
                         <div>
                            <CardTitle className="text-amber-700 dark:text-amber-500">Certificate Revoked</CardTitle>
                            <CardDescription className="text-amber-600/80 dark:text-amber-500/80">This certificate is no longer valid.</CardDescription>
                         </div>
                    </CardHeader>
                     <CardContent>
                        <div className="space-y-4 text-sm mt-4">
                            <div>
                                <p className="font-semibold text-muted-foreground">RECIPIENT</p>
                                <p className="font-medium text-foreground">{result.data?.studentName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">COURSE</p>
                                <p className="font-medium text-foreground">{result.data?.courseName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        if (result.status === 'valid' && result.data) {
             const { studentName, courseName, issueDate, certificateCode } = result.data;
             return (
                <Card className="border-green-500/50 bg-green-500/10">
                    <CardHeader className="flex-row items-center gap-4 pb-4">
                        <Award className="h-10 w-10 text-green-600" />
                        <div>
                            <CardTitle className="text-green-700 dark:text-green-400">Certificate Verified</CardTitle>
                            <CardDescription className="text-green-600/80 dark:text-green-400/80">This is an authentic certificate issued by CourseVerse.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator className="bg-green-500/30"/>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-semibold text-muted-foreground">RECIPIENT</p>
                                <p className="font-bold text-lg text-foreground">{studentName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-muted-foreground">COURSE COMPLETED</p>
                                <p className="font-bold text-lg text-foreground">{courseName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <p className="font-semibold text-muted-foreground">ISSUE DATE</p>
                                    <p className="font-medium text-foreground">{format(issueDate.toDate(), 'MMMM d, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">STATUS</p>
                                    <p className="font-medium text-green-600 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Valid</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="bg-green-500/10 p-4 flex flex-col sm:flex-row gap-2">
                        <Button asChild className="w-full" size="lg" variant="secondary">
                            <Link href={`/certificate/${certificateCode}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Certificate
                            </Link>
                        </Button>
                        <Button onClick={() => handleDownload(certificateCode)} disabled={isDownloading} className="w-full" size="lg">
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                            {isDownloading ? 'Generating...' : 'Download PDF'}
                        </Button>
                    </CardFooter>
                </Card>
             )
        }

        return null;
    }

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Award className="h-8 w-8 text-primary"/>
                        </div>
                        <CardTitle className="text-3xl font-bold">Verify a Certificate</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Enter the unique code from the certificate to confirm its authenticity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFormSubmit} className="flex gap-2">
                            <Input 
                                value={certificateCode}
                                onChange={(e) => setCertificateCode(e.target.value)}
                                placeholder="e.g., CV-CYB-A0B1-C2D3"
                                className="h-12 text-lg flex-grow"
                                disabled={isLoading}
                                required
                            />
                            <Button type="submit" size="lg" className="h-12" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5"/>}
                                <span className="sr-only">Verify</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="mt-8">
                   <VerificationResultCard />
                </div>
            </div>
        </div>
    );
}
