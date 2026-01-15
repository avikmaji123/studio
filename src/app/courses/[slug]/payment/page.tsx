
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, Timestamp, query, where, collection, getDocs, limit, collectionGroup } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { autoHandleEngine } from '@/ai/flows/auto-handle-engine';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLogEntry } from '@/lib/actions';
import type { Course } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Hardcoded site configuration for payment verification
const SITE_CONFIG = {
    RECEIVER_UPI_ID: 'avik911@fam'
};

export default function CoursePaymentPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const firestore = useFirestore();
    const slug = params.slug as string;
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [utr, setUtr] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!slug || !firestore) return;
        const getCourse = async () => {
            setIsLoadingCourse(true);
            const q = query(collection(firestore, 'courses'), where('slug', '==', slug), limit(1));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                notFound();
            } else {
                setCourse({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Course);
            }
            setIsLoadingCourse(false);
        };
        getCourse();
    }, [slug, firestore]);
    
    if (isLoadingCourse) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin"/></div>
    }

    if (!course) {
        notFound();
    }
    
    const qrCodeImage = PlaceHolderImages.find(p => p.id === 'payment-qr-code');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isUtrUsed = async (utr: string): Promise<boolean> => {
        if (!firestore) return true; // Fail safe
        const paymentsRef = collectionGroup(firestore, 'paymentTransactions');
        const q = query(paymentsRef, where('upiTransactionReference', '==', utr));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to verify a payment.",
            });
            router.push('/login');
            return;
        }

        if (!utr || !screenshotFile || !screenshotPreview) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide both a UTR/Transaction ID and a screenshot.",
            });
            return;
        }

        setIsLoading(true);
        await createLogEntry({
            source: 'user',
            severity: 'info',
            message: 'Payment verification submitted.',
            metadata: { userId: user.uid, courseId: course.id }
        });

        // 1. Check if UTR has been used before
        if (await isUtrUsed(utr)) {
            toast({ variant: "destructive", title: "Verification Failed", description: "This Transaction ID has already been used." });
            await createLogEntry({ source: 'system', severity: 'warning', message: 'Duplicate UTR submission attempt.', metadata: { userId: user.uid, courseId: course.id, error: `UTR: ${utr}` }});
            setIsLoading(false);
            return;
        }

        try {
            // 2. Get AI analysis
            const aiResult = await autoHandleEngine({ 
                coursePrice: course.price,
                screenshotDataUri: screenshotPreview,
            });

            const transactionId = uuidv4();
            const paymentRef = doc(firestore, 'users', user.uid, 'paymentTransactions', transactionId);

            // 3. Perform Hard Validation Checks
            let finalStatus: 'AI-Approved' | 'Pending' | 'Rejected' = 'Pending';
            let failureReason = '';

            const expectedAmount = parseFloat(course.price.replace('₹', ''));
            const detectedAmount = aiResult.amountDetected ? parseFloat(aiResult.amountDetected.replace('₹', '')) : 0;
            
            if (aiResult.riskScore === 'high') {
                finalStatus = 'Rejected';
                failureReason = `High-risk screenshot: ${aiResult.reasoning}`;
            } else if (aiResult.receiverUpiIdDetected && aiResult.receiverUpiIdDetected.toLowerCase() !== SITE_CONFIG.RECEIVER_UPI_ID.toLowerCase()) {
                finalStatus = 'Rejected';
                failureReason = `Payment sent to incorrect UPI ID. Detected: ${aiResult.receiverUpiIdDetected}`;
            } else if (detectedAmount < expectedAmount) {
                finalStatus = 'Rejected';
                failureReason = `Amount mismatch. Expected ₹${expectedAmount}, but detected ₹${detectedAmount}.`;
            } else if (aiResult.riskScore === 'medium') {
                finalStatus = 'Pending'; // Needs manual review
            } else {
                finalStatus = 'AI-Approved';
            }


            // 4. Log the transaction attempt to Firestore
            await setDoc(paymentRef, {
                id: transactionId,
                userId: user.uid,
                courseId: course.id,
                amount: expectedAmount,
                pointsAwarded: expectedAmount, // Or your points logic
                upiTransactionReference: utr,
                screenshotUrl: '', // Uploading screenshot to storage can be added here
                status: finalStatus,
                transactionDate: Timestamp.now(),
                adminNotes: `AI Analysis: [${aiResult.riskScore}] ${aiResult.reasoning}. Detected Amount: ${aiResult.amountDetected || 'N/A'}. Detected UTR: ${aiResult.utrDetected || 'N/A'}. Detected Receiver: ${aiResult.receiverUpiIdDetected || 'N/A'}.`,
            });
            
            // 5. Grant access ONLY if approved
            if (finalStatus === 'AI-Approved') {
                const enrollmentRef = doc(firestore, 'users', user.uid, 'enrollments', course.id);
                await setDoc(enrollmentRef, {
                    id: course.id,
                    userId: user.uid,
                    courseId: course.id,
                    enrollmentDate: Timestamp.now(),
                    completionPercentage: 0,
                });
                
                await createLogEntry({ source: 'system', severity: 'info', message: 'AI payment verification successful.', metadata: { userId: user.uid, courseId: course.id }});

                toast({ title: "Purchase successful!", description: "Your course is now available for download." });
                router.push('/dashboard/downloads');
            } else {
                 await createLogEntry({ source: 'system', severity: 'warning', message: `Payment verification failed hard checks. Status: ${finalStatus}`, metadata: { userId: user.uid, courseId: course.id, error: failureReason || aiResult.reasoning }});
                 
                 toast({
                    variant: "destructive",
                    title: "Verification Pending or Failed",
                    description: failureReason || "AI analysis requires manual review. We will notify you once it's complete.",
                    duration: 9000,
                });
                router.push('/dashboard');
            }

        } catch (error: any) {
            console.error("Payment submission error:", error);
            const errorMessage = error?.message || "An unknown error occurred with the AI verification service.";
            await createLogEntry({ source: 'system', severity: 'critical', message: 'AI payment verification service error.', metadata: { userId: user.uid, courseId: course.id, error: errorMessage }});
            
            toast({ variant: "destructive", title: "Verification Service Error", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
             <div className="mb-8">
                <Button asChild variant="ghost">
                    <Link href={`/courses/${course.slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Course
                    </Link>
                </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    {/* Course Info Card */}
                    <Card className="overflow-hidden">
                        <CardHeader>
                             <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {course.imageUrl && (
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={course.imageUrl}
                                        alt={course.title}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <h2 className="text-xl font-semibold">{course.title}</h2>
                            <p className="text-3xl font-bold text-primary">{course.price}</p>
                        </CardContent>
                    </Card>

                    {/* Payment QR Code Card */}
                     <Card>
                        <CardHeader>
                            <CardTitle>1. Scan & Pay</CardTitle>
                            <CardDescription>Use your favorite UPI app to pay the exact amount shown above.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            {qrCodeImage && (
                                <Image 
                                    src={qrCodeImage.imageUrl} 
                                    alt="Payment QR Code" 
                                    width={250} 
                                    height={250}
                                    data-ai-hint={qrCodeImage.imageHint}
                                    className="rounded-lg border p-2"
                                />
                            )}
                             <div className="text-center">
                                <p className="font-bold text-lg">CourseVerse</p>
                                <p className="text-muted-foreground">UPI ID: {SITE_CONFIG.RECEIVER_UPI_ID}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submission Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Confirm Your Payment</CardTitle>
                            <CardDescription>
                                After paying, enter your transaction details and upload a screenshot to get access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="utr">UTR / Transaction ID</Label>
                                    <Input 
                                        id="utr"
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                        placeholder="Enter your 12-digit UTR"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="screenshot">Payment Screenshot</Label>
                                     <div className="relative">
                                        <Input
                                            id="screenshot"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isLoading}
                                        />
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                            {screenshotPreview ? (
                                                <Image src={screenshotPreview} alt="Screenshot preview" width={150} height={150} className="mx-auto rounded-md object-contain h-32" />
                                            ) : (
                                                <div className="space-y-2 text-muted-foreground">
                                                    <Upload className="mx-auto h-8 w-8" />
                                                    <p>Click or drag to upload</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? 'Verifying Payment...' : 'Verify & Get Access'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
