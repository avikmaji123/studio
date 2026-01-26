
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Percent,
  UserPlus,
  Package,
  Sparkles,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

const growthFeatures = [
  {
    title: 'Limited-Time Offers',
    description: 'Manage sales campaigns by setting offer prices on courses.',
    Icon: DollarSign,
    href: '/admin911/courses',
    isReady: true,
  },
  {
    title: 'Coupons',
    description: 'Create and manage discount codes for specific courses or global use.',
    Icon: Percent,
    href: '/admin911/growth/coupons',
    isReady: true,
  },
  {
    title: 'Affiliate Program',
    description: 'Oversee your referral program, commissions, and performance.',
    Icon: UserPlus,
    href: '/admin911/growth/affiliates',
    isReady: true,
  },
  {
    title: 'Course Bundles',
    description: 'Group courses together and sell them at a special, unified price.',
    Icon: Package,
    href: '/admin911/growth/bundles',
    isReady: true,
  },
];

const FeatureCard = ({
  feature,
}: {
  feature: (typeof growthFeatures)[0];
}) => {
  const Wrapper = feature.isReady ? Link : 'div';
  const wrapperProps = feature.isReady
    ? { href: feature.href }
    : { 'aria-disabled': true };

  return (
    <Wrapper {...wrapperProps}>
      <Card
        className={cn(
          'h-full transition-all duration-300',
          feature.isReady
            ? 'hover:-translate-y-1 hover:shadow-lg'
            : 'opacity-60 blur-[0.5px] cursor-not-allowed'
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
          <feature.Icon
            className={cn(
              'h-6 w-6',
              feature.isReady ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
          {!feature.isReady && (
            <Badge variant="outline" className="mt-4">
              <Lock className="mr-1.5 h-3 w-3" />
              Coming Soon
            </Badge>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default function GrowthDashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">
          Growth &amp; Monetization Hub
        </h1>
        <p className="text-muted-foreground">
          Manage all your sales, marketing, and affiliate tools from one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {growthFeatures.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>

       <Link href="/admin911/growth/ai-insights">
        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              AI Pricing Intelligence
            </CardTitle>
            <Sparkles className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get AI-driven insights to optimize your pricing, offers, and
              bundles.
            </p>
          </CardContent>
        </Card>
      </Link>
    </main>
  );
}
