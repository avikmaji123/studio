import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server'; 
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
        
        // Go to the render page and wait for network activity to be minimal.
        // This is more reliable for ensuring fonts and other resources are loaded.
        await page.goto(renderUrl, { waitUntil: 'networkidle2' });

        // As a final guarantee, also wait for the client-side JS to render the QR code.
        await page.waitForSelector('[data-testid="qr-code-container"]', { timeout: 10000 });

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
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Failed to close browser instance:', closeError);
            }
        }
        return NextResponse.json({ error: 'An unexpected error occurred during PDF generation.' }, { status: 500 });
    }
}
