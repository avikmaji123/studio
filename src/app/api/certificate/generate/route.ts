import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server'; 
import type { Certificate } from '@/lib/types';
import { headers } from 'next/headers';
import puppeteer from 'puppeteer';

const getAbsoluteUrl = (path: string) => {
  const host = headers().get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
};

export async function POST(req: NextRequest) {
    let browser;
    try {
        const { certificateCode } = await req.json();
        if (!certificateCode || typeof certificateCode !== 'string') {
            return NextResponse.json({ error: 'Certificate code is required.' }, { status: 400 });
        }

        const { firestore } = getSdks();
        const certRef = doc(firestore, 'certificates', certificateCode);
        const docSnap = await getDoc(certRef);

        if (!docSnap.exists() || docSnap.data().status !== 'valid') {
            return NextResponse.json({ error: 'Certificate not found or is invalid.' }, { status: 404 });
        }

        // The URL for the isolated certificate render page
        const renderUrl = getAbsoluteUrl(`/certificate/${certificateCode}/render`);

        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        // Go to the render page
        await page.goto(renderUrl, { waitUntil: 'networkidle0' });

        const pdfBytes = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            pageRanges: '1',
        });
        
        await browser.close();
        browser = undefined;

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse_Certificate_${certificateCode}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PUPPETEER PDF Generation API Error:', error);
        if (browser) {
            await browser.close();
        }
        return NextResponse.json({ error: 'An unexpected error occurred during PDF generation.' }, { status: 500 });
    }
}
