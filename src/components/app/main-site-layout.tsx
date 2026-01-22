'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/app/header';
import Footer from '@/components/app/footer';

export default function MainSiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCertificatePage = pathname.startsWith('/certificate/');

    if (isCertificatePage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
