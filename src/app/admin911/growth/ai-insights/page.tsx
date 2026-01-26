
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Sparkles, Package } from "lucide-react";

export default function AiInsightsPage() {

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight">AI Pricing Intelligence</h1>
                <p className="text-muted-foreground">
                    Actionable insights from your sales and user data to help you grow.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Pricing Suggestion</CardTitle>
                            <CardDescription>For "Advanced Web Security"</CardDescription>
                        </div>
                        <Lightbulb className="h-6 w-6 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            Consider increasing the price from <span className="font-bold">₹799</span> to <span className="font-bold text-primary">₹999</span>.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-semibold">Reasoning:</span> This course has a high completion rate (85%) and consistently positive reviews, indicating strong perceived value. A price increase is unlikely to impact sales velocity significantly.
                        </p>
                        <div className="flex gap-2 mt-4">
                            <Button size="sm">Accept Suggestion</Button>
                            <Button size="sm" variant="ghost">Dismiss</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Offer Opportunity</CardTitle>
                            <CardDescription>For "The Complete Ethical Hacking Bootcamp"</CardDescription>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            Run a <span className="font-bold text-primary">25% off</span> limited-time offer for 72 hours.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-semibold">Reasoning:</span> Sales have slowed by 30% over the last 2 weeks. A short, aggressive campaign could recapture momentum and boost enrollment.
                        </p>
                         <div className="flex gap-2 mt-4">
                            <Button size="sm">Create Offer</Button>
                            <Button size="sm" variant="ghost">Dismiss</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Bundle Recommendation</CardTitle>
                            <CardDescription>Create a new "Cyber Defender" bundle</CardDescription>
                        </div>
                        <Package className="h-6 w-6 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                           Bundle <span className="font-bold">"Ethical Hacking"</span> and <span className="font-bold">"Web Security"</span> for <span className="font-bold text-primary">₹1499</span>.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-semibold">Reasoning:</span> 45% of users who bought one of these courses purchased the other within 30 days. A bundle offers better value and could increase average order value.
                        </p>
                         <div className="flex gap-2 mt-4">
                            <Button size="sm">Create Bundle</Button>
                            <Button size="sm" variant="ghost">Dismiss</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Coupon Performance</CardTitle>
                            <CardDescription>Analysis of "WELCOME10"</CardDescription>
                        </div>
                        <Sparkles className="h-6 w-6 text-fuchsia-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                           The <span className="font-bold font-mono">WELCOME10</span> coupon has a <span className="font-bold text-primary">78%</span> conversion rate on first-time buyers.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-semibold">Suggestion:</span> Consider making this a permanent automated offer for new sign-ups to maximize new user conversion.
                        </p>
                         <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">View Analytics</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
