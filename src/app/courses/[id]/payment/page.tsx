'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { autoHandleEngine, AutoHandleEngineInput } from '@/ai/flows/auto-handle-engine';
import { Loader2 } from 'lucide-react';
import { courses } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CoursePaymentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [utr, setUtr] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const course = courses.find(c => c.id === id);

    if (!course) {
        notFound();
    }

    const courseImage = PlaceHolderImages.find(p => p.id === course.imageId);
    const qrCodeImage = PlaceHolderImages.find(p => p.id === 'payment-qr-code');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // NOTE: In a real app, you would check for user authentication here.
        
        if (!utr || !screenshot) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide both the UTR and a screenshot.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const screenshotDataUri = await fileToDataUri(screenshot);
            
            const input: AutoHandleEngineInput = {
                utr,
                timestamp: new Date().toISOString(),
                screenshotDataUri,
            };

            const result = await autoHandleEngine(input);
            
            if (result.suggestion === 'approve') {
                toast({
                    title: "Payment Verified!",
                    description: "Your access to the course has been granted.",
                });
                // In a real app, you would grant access and then redirect.
                router.push('/downloads');
            } else {
                 toast({
                    title: "Submission Under Review",
                    description: (
                        <div className="space-y-2">
                            <p>{result.reasoning}</p>
                            <p className="font-bold">Suggestion: <span className="capitalize">{result.suggestion}</span></p>
                            <p>Please wait for manual approval or contact support if this seems incorrect.</p>
                        </div>
                    ),
                    duration: 9000,
                });
            }

        } catch (error) {
            console.error("Payment submission error:", error);
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "There was an error verifying your payment. Please try again or contact support.",
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
                            <CardTitle>Scan & Pay</CardTitle>
                            <CardDescription>Use your favorite UPI app to pay the exact amount.</CardDescription>
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
                            <CardTitle>Confirm Your Payment</CardTitle>
                            <CardDescription>
                                After paying, submit the details below for instant verification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="utr">UTR / Transaction ID</Label>
                                    <Input 
                                        id="utr" 
                                        placeholder="Enter the 12-digit UTR"
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="screenshot">Payment Screenshot</Label>
                                    <Input 
                                        id="screenshot" 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required 
                                    />
                                     <p className="text-xs text-muted-foreground">Upload a screenshot of the payment confirmation.</p>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? 'Verifying...' : 'Verify & Get Access'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
