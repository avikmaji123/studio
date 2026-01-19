
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, qrCodeUrl } = body;

        if (!code || !qrCodeUrl) {
            return NextResponse.json({ error: 'Missing certificate code or QR URL' }, { status: 400 });
        }

        // The URL for the certificate page that Puppeteer will visit.
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/certificate/${code}?qrCodeUrl=${encodeURIComponent(qrCodeUrl)}`;
        
        const browser = await puppeteer.launch({ 
            headless: true,
            // Important for running in serverless environments
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        // Navigate to the page and wait until all network requests are finished.
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Generate PDF from the specific certificate canvas element
        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            pageRanges: '1',
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse_Certificate_${code}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred during PDF generation.' }, { status: 500 });
    }
}
