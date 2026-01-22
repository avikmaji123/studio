'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { SiteSettings } from '@/lib/types';

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
};

export function useSiteSettings() {
    const firestore = useFirestore();
    const settingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'global');
    }, [firestore]);

    const { data, isLoading, error } = useDoc<SiteSettings>(settingsRef);

    const settings = useMemo(() => {
        // Deep merge social links to handle cases where new links are added to defaults
        if (data) {
            const mergedSocialLinks = defaultSettings.socialLinks.map(defaultLink => {
                const savedLink = data.socialLinks?.find(saved => saved.id === defaultLink.id);
                return savedLink ? { ...defaultLink, ...savedLink } : defaultLink;
            });
            return { ...defaultSettings, ...data, socialLinks: mergedSocialLinks };
        }
        return defaultSettings;
    }, [data]);

    return {
        settings,
        isLoading,
        error
    };
}
