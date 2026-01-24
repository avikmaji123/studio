
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, UserPlus, Package } from "lucide-react";
import Link from 'next/link';

const growthFeatures = [
    {
        title: "Limited-Time Offers",
        description: "Manage AI-powered and manual sales campaigns.",
        icon: <DollarSign className="h-6 w-6 text-primary" />,
        href: "/admin911/courses" // Offers are managed per-course
    },
    {
        title: "Coupons",
        description: "Create and manage discount codes.",
        icon: <Percent className="h-6 w-6 text-primary" />,
        href: "/admin911/growth/coupons"
    },
    {
        title: "Affiliate Program",
        description: "Oversee your referral and commission system.",
        icon: <UserPlus className="h-6 w-6 text-primary" />,
        href: "/admin911/growth/affiliates"
    },
    {
        title: "Course Bundles",
        description: "Group courses together for special pricing.",
        icon: <Package className="h-6 w-6 text-primary" />,
        href: "/admin911/growth/bundles"
    }
];

export default function GrowthDashboardPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight">Growth & Monetization Hub</h1>
                <p className="text-muted-foreground">
                    Manage all your sales, marketing, and affiliate tools from one place.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {growthFeatures.map(feature => (
                    <Link key={feature.title} href={feature.href} className="block hover:-translate-y-1 transition-transform">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                                {feature.icon}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>AI Pricing Intelligence</CardTitle>
                    <CardDescription>
                        Get AI-driven insights to optimize your pricing, offers, and bundles. This feature is under development.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
            </Card>
        </main>
    );
}
