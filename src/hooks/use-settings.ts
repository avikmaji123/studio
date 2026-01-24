'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { SiteSettings, Review } from '@/lib/types';

export const defaultSettings: SiteSettings = {
    id: 'global',
    siteName: 'CourseVerse',
    tagline: 'Your universe for high-quality licensed courses.',
    description: 'A premium distribution platform for licensed educational content.',
    footerText: '© 2024 CourseVerse. All rights reserved.',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
    enableGoogleLogin: true,
    enableEmailLogin: true,
    disablePurchases: false,
    upiId: 'avik911@fam',
    receiverName: 'CourseVerse',
    currencySymbol: '₹',
    paymentInstructions: 'Use your favorite UPI app to pay the exact amount. After paying, enter your transaction details and upload a screenshot to get access.',
    qrCodeUrl: 'https://i.ibb.co/cS1LWSL4/Screenshot-20251122-073557.png',
    socialLinks: [
        { id: 'github', name: 'GitHub', url: 'https://github.com/alexavik', visible: true },
        { id: 'telegram', name: 'Telegram', url: 'https://t.me/Avikmaji122911', visible: true },
        { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/avik_911', visible: true },
    ],
    isInitialAdminCreated: false,
    featuredReviews: [
        {
            id: 'demo-review-1',
            userId: 'demo-user-1',
            courseId: 'demo-course-1',
            userName: 'Priya Sharma',
            userAvatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBzbWlsaW5nfGVufDB8fHx8fDE3NjgyNDI0MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            courseName: 'The Complete Ethical Hacking Bootcamp',
            rating: 5,
            title: 'Absolutely Changed My Career Path!',
            text: 'This course was incredibly comprehensive and well-structured. The hands-on labs were invaluable. I went from having basic IT knowledge to landing a junior penetration tester role.',
            status: 'approved',
            createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
            isVerifiedPurchase: true,
            source: 'user',
        },
        {
            id: 'demo-review-2',
            userId: 'demo-user-2',
            courseId: 'demo-course-2',
            userName: 'Rohan Verma',
            userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwcm9mZXNzaW9uYWwlMjBtYW58ZW58MHx8fHwxNzY4MzAzODUxfDA&ixlib-rb-4.1.0&q=80&w=1080',
            courseName: 'Advanced Web Security & Bug Bounties',
            rating: 5,
            title: 'A Must for Aspiring Security Professionals',
            text: "The content is advanced yet explained clearly. I've already found and reported my first valid bug thanks to the techniques taught in this course. Highly recommended.",
            status: 'approved',
            createdAt: new Date('2024-07-18T15:30:00Z').toISOString(),
            isVerifiedPurchase: true,
            source: 'user',
        }
    ],
};

export function useSiteSettings() {
    const firestore = useFirestore();
    const settingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'global');
    }, [firestore]);

    const { data, isLoading, error } = useDoc<SiteSettings>(settingsRef);

    const settings = useMemo(() => {
        if (data) {
            const mergedSocialLinks = defaultSettings.socialLinks.map(defaultLink => {
                const savedLink = data.socialLinks?.find(saved => saved.id === defaultLink.id);
                return savedLink ? { ...defaultLink, ...savedLink } : defaultLink;
            });
            
            // Use database reviews if they exist and are not empty, otherwise use default demo reviews
            const featuredReviews = (data.featuredReviews && data.featuredReviews.length > 0)
                ? data.featuredReviews
                : defaultSettings.featuredReviews;

            return { ...defaultSettings, ...data, socialLinks: mergedSocialLinks, featuredReviews };
        }
        return defaultSettings;
    }, [data]);

    return {
        settings,
        isLoading,
        error
    };
}
