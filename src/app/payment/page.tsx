
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { autoHandleEngine, AutoHandleEngineInput } from '@/ai/flows/auto-handle-engine';
import { Loader2 } from 'lucide-react';

export default function PaymentPage() {
    const { toast } = useToast();
    const [utr, setUtr] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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
            
            toast({
                title: "Submission Analysis",
                description: (
                    <div className="space-y-2">
                        <p>{result.reasoning}</p>
                        <p>Trust Score: {result.trustScore}</p>
                        <p className="font-bold">Suggestion: <span className="capitalize">{result.suggestion}</span></p>
                    </div>
                )
            });

        } catch (error) {
            console.error("Payment submission error:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was an error submitting your payment details. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Scan & Pay</CardTitle>
                            <CardDescription>Use your favorite UPI app to make the payment.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            {qrCodeImage && (
                                <Image 
                                    src={qrCodeImage.imageUrl} 
                                    alt="Payment QR Code" 
                                    width={300} 
                                    height={300}
                                    data-ai-hint={qrCodeImage.imageHint}
                                    className="rounded-lg border p-2"
                                />
                            )}
                             <div className="text-center">
                                <p className="font-bold text-lg">CourseVerse</p>
                                <p className="text-muted-foreground">UPI ID: courseverse@example</p>
                            </div>
                        </CardContent>
                    </Card>
                     <div className="prose dark:prose-invert text-muted-foreground space-y-4">
                        <h3 className="text-foreground">Instructions</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Scan the QR code using any UPI payment app (Google Pay, PhonePe, Paytm, etc.).</li>
                            <li>Enter the amount for your chosen plan.</li>
                            <li>After a successful payment, take a screenshot of the confirmation screen.</li>
                            <li>Note down the UTR/Transaction ID.</li>
                            <li>Fill out the form on the right and upload the screenshot.</li>
                            <li>Your access will be activated upon successful verification by our system.</li>
                        </ol>
                    </div>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit Payment Details</CardTitle>
                            <CardDescription>
                                After payment, please submit the details below for verification.
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
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? 'Verifying...' : 'Submit for Verification'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
