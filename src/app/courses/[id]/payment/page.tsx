'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { autoHandleEngine } from '@/ai/flows/auto-handle-engine';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import { courses } from '@/lib/data';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CoursePaymentPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const firestore = useFirestore();
    const id = params.id as string;
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [utr, setUtr] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    
    const course = courses.find(c => c.id === id);

    if (!course) {
        notFound();
    }

    const courseImage = PlaceHolderImages.find(p => p.id === course.imageId);
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

        try {
            const result = await autoHandleEngine({ 
                coursePrice: course.price,
                utr,
                screenshotDataUri: screenshotPreview,
            });
            
            if (result.verified) {
                // Grant course access in Firestore
                const enrollmentRef = doc(firestore, 'users', user.uid, 'enrollments', course.id);
                await setDoc(enrollmentRef, {
                    id: course.id,
                    userId: user.uid,
                    courseId: course.id,
                    enrollmentDate: Timestamp.now(),
                    completionPercentage: 0,
                });

                toast({
                    title: "Payment Verified!",
                    description: "Your access to the course has been granted. Redirecting...",
                });
                router.push('/dashboard/courses');
            } else {
                 toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: result.reasoning || "Could not verify payment. Please check your details and try again.",
                    duration: 9000,
                });
            }

        } catch (error: any) {
            console.error("Payment submission error:", error);
            let errorMessage = "An unknown error occurred with the AI verification service. Please try again later.";
            if (error?.message && error.message.includes('503 Service Unavailable')) {
                errorMessage = "The verification service is currently busy. Please wait a moment and try again.";
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            toast({
                variant: "destructive",
                title: "Verification Service Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
             <div className="mb-8">
                <Button asChild variant="ghost">
                    <Link href={`/courses/${course.id}`}>
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
                           {courseImage && (
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={courseImage.imageUrl}
                                        alt={course.title}
                                        data-ai-hint={courseImage.imageHint}
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
                                <p className="text-muted-foreground">UPI ID: avik911@fam</p>
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
                                After paying, enter your transaction details and upload a screenshot to verify.
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
                                    {isLoading ? 'Verifying Payment...' : 'Verify My Payment & Get Access'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
