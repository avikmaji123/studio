
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { createLogEntry } from '@/lib/actions';
import type { Course, PaymentTransaction, Coupon, Insight } from '@/lib/types';
import { generatePricingInsights, type GeneratePricingInsightsOutput } from '@/ai/flows/generate-pricing-insights';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, TrendingUp, Sparkles, Package, Tag, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { add } from 'date-fns';
import Link from 'next/link';

// Component for a single insight card
function InsightCard({ insight, onAction }: { insight: Insight; onAction: () => void }) {
    const [isApplying, setIsApplying] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { user: adminUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleAction = async () => {
        if (!firestore || !adminUser) return;
        setIsApplying(true);

        try {
            if (insight.type === 'PRICE_SUGGESTION' || insight.type === 'OFFER_OPPORTUNITY') {
                const courseRef = doc(firestore, 'courses', insight.courseId);
                let updateData: Partial<Course> = {};
                let logMessage = '';

                if (insight.type === 'PRICE_SUGGESTION') {
                    updateData = { price: `₹${insight.suggestedPrice}` };
                    logMessage = `AI price suggestion applied for ${insight.courseTitle}. New price: ₹${insight.suggestedPrice}`;
                } else { // OFFER_OPPORTUNITY
                    const offerEndDate = add(new Date(), { hours: insight.durationHours });
                    updateData = {
                        discountPrice: `₹${Math.round(insight.currentPrice * (1 - insight.suggestedDiscountPercentage / 100))}`,
                        offerEndDate: Timestamp.fromDate(offerEndDate),
                    };
                    logMessage = `AI offer suggestion applied for ${insight.courseTitle}.`;
                }

                await updateDoc(courseRef, updateData);
                await createLogEntry({
                    source: 'admin',
                    severity: 'info',
                    message: logMessage,
                    metadata: { userId: adminUser.uid, courseId: insight.courseId }
                });
                toast({ title: "Suggestion Applied", description: "The course has been updated." });
                onAction(); // Trigger re-fetch/re-analysis
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to Apply Suggestion', description: error.message });
        } finally {
            setIsApplying(false);
            setIsDialogOpen(false);
        }
    };

    const getIcon = () => {
        switch (insight.type) {
            case 'PRICE_SUGGESTION': return <Lightbulb className="h-6 w-6 text-yellow-400" />;
            case 'OFFER_OPPORTUNITY': return <TrendingUp className="h-6 w-6 text-green-500" />;
            case 'COUPON_ANALYSIS': return <Tag className="h-6 w-6 text-blue-500" />;
            default: return <Sparkles className="h-6 w-6 text-fuchsia-500" />;
        }
    };

    const renderContent = () => {
        switch (insight.type) {
            case 'PRICE_SUGGESTION':
                return (
                    <p className="text-lg">
                        Consider changing the price of "{insight.courseTitle}" from <span className="font-bold">₹{insight.currentPrice}</span> to <span className="font-bold text-primary">₹{insight.suggestedPrice}</span>.
                    </p>
                );
            case 'OFFER_OPPORTUNITY':
                 const newPrice = Math.round(insight.currentPrice * (1 - insight.suggestedDiscountPercentage / 100));
                return (
                    <p className="text-lg">
                        Run a <span className="font-bold text-primary">{insight.suggestedDiscountPercentage}% off</span> limited-time offer on "{insight.courseTitle}" for {insight.durationHours / 24} days (New Price: ₹{newPrice}).
                    </p>
                );
            case 'COUPON_ANALYSIS':
                return (
                    <p className="text-lg">
                       The coupon <span className="font-bold font-mono">{insight.couponCode}</span> has a <span className="font-bold text-primary">{insight.conversionRate.toFixed(1)}%</span> conversion rate with {insight.totalUses} uses.
                    </p>
                );
            default:
                return null;
        }
    };

    const getAction = () => {
        switch (insight.type) {
            case 'PRICE_SUGGESTION':
                return <Button size="sm" onClick={() => setIsDialogOpen(true)} disabled={isApplying}>{isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Accept Suggestion</Button>;
            case 'OFFER_OPPORTUNITY':
                return <Button size="sm" onClick={() => setIsDialogOpen(true)} disabled={isApplying}>{isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Create Offer</Button>;
            case 'COUPON_ANALYSIS':
                return <Button size="sm" variant="outline" asChild><Link href="/admin911/growth/coupons">Manage Coupons</Link></Button>;
            default:
                return null;
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>{insight.type.replace(/_/g, ' ')}</CardTitle>
                        <CardDescription>AI Generated Insight</CardDescription>
                    </div>
                    {getIcon()}
                </CardHeader>
                <CardContent>
                    {renderContent()}
                    <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-semibold">Reasoning:</span> {insight.reasoning}
                    </p>
                    <div className="flex gap-2 mt-4">
                        {getAction()}
                        <Button size="sm" variant="ghost">Dismiss</Button>
                    </div>
                </CardContent>
            </Card>
             <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will apply the AI's suggestion and update live data on your site. This action will be logged.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction}>Yes, apply change</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export default function AiInsightsPage() {
    const firestore = useFirestore();
    const [insights, setInsights] = useState<GeneratePricingInsightsOutput['insights']>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all necessary data
    const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
    const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

    const paymentsQuery = useMemoFirebase(() => collectionGroup(firestore, 'paymentTransactions'), [firestore]);
    const { data: transactions, isLoading: paymentsLoading } = useCollection<PaymentTransaction>(paymentsQuery);
    
    const couponsQuery = useMemoFirebase(() => collection(firestore, 'coupons'), [firestore]);
    const { data: coupons, isLoading: couponsLoading } = useCollection<Coupon>(couponsQuery);
    
    const [key, setKey] = useState(0); // Used to force re-analysis

    useEffect(() => {
        const isDataLoading = coursesLoading || paymentsLoading || couponsLoading;
        if (isDataLoading) {
            setIsLoading(true);
            return;
        }

        const runAnalysis = async () => {
            setIsLoading(true);

            // Prepare data for the AI flow
            const coursesForAI = courses?.map(c => ({
                id: c.id,
                title: c.title,
                price: c.price,
                enrollmentCount: c.enrollmentCount || 0,
                status: c.status
            })) || [];

            const transactionsForAI = transactions?.map(t => ({
                courseId: t.courseId,
                amount: t.amount,
                transactionDate: t.transactionDate.toDate().toISOString(),
                couponUsed: 'N/A' // This would require a field on the transaction
            })) || [];
            
            try {
                const result = await generatePricingInsights({
                    courses: coursesForAI,
                    transactions: transactionsForAI,
                    coupons: coupons || []
                });
                setInsights(result.insights);
            } catch (e) {
                console.error("Failed to generate AI insights:", e);
                // Optionally set an error state here
            } finally {
                setIsLoading(false);
            }
        };

        runAnalysis();
    }, [courses, transactions, coupons, coursesLoading, paymentsLoading, couponsLoading, key]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">AI Pricing Intelligence</h1>
                    <p className="text-muted-foreground">
                        Actionable insights from your sales and user data to help you grow.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setKey(k => k + 1)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Refresh Insights
                </Button>
            </div>
            
            {isLoading ? (
                 <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
            ) : insights.length > 0 ? (
                 <div className="grid gap-6 lg:grid-cols-2">
                    {insights.map((insight, index) => (
                        <InsightCard key={index} insight={insight} onAction={() => setKey(k => k + 1)} />
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <CardHeader>
                        <div className="mx-auto bg-muted p-4 rounded-full w-fit">
                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">No Actionable Insights Found</CardTitle>
                        <CardDescription>
                            The AI has analyzed your data but hasn't found any strong recommendations at this time.
                            <br/>
                            More sales and user activity will help generate better insights.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </main>
    );
}
