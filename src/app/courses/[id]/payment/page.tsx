'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { verifyFamPayPayment } from '@/ai/flows/verify-fampay-payment-flow';
import { Loader2, ArrowLeft } from 'lucide-react';
import { courses } from '@/lib/data';
import Link from 'next/link';
import { useUser } from '@/firebase';

export default function CoursePaymentPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const id = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const course = courses.find(c => c.id === id);

    if (!course) {
        notFound();
    }

    const courseImage = PlaceHolderImages.find(p => p.id === course.imageId);
    const qrCodeImage = PlaceHolderImages.find(p => p.id === 'payment-qr-code');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to verify a payment.",
            });
            router.push('/login');
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyFamPayPayment({ 
                courseId: course.id,
                coursePrice: course.price,
                userId: user.uid,
            });
            
            if (result.verified) {
                toast({
                    title: "Payment Verified!",
                    description: "Your access to the course has been granted. Redirecting...",
                });
                router.push('/dashboard/courses');
            } else {
                 toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: result.reasoning || "Could not verify payment. Please ensure you have paid the correct amount and try again in a moment.",
                    duration: 9000,
                });
            }

        } catch (error: any) {
            console.error("Payment submission error:", error);
            const errorMessage = error?.message || "An unknown error occurred with the AI verification service. Please try again later.";
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
                                After paying, click the button below. Our automated system will verify your payment via Gmail.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">
                                   Our system will securely check for a new payment confirmation email from FamPay in the administrator's Gmail account. No UTR or screenshot is needed.
                                </p>
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
