import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// This is the core of the PDF generation logic
async function generatePdf(certificateCode: string, request: NextRequest) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // Construct the full URL to the NEW server-only render page
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        const url = new URL(`/pdf-render/${certificateCode}`, baseUrl);

        // Navigate to the page and wait for it to be fully loaded
        await page.goto(url.toString(), {
            waitUntil: 'networkidle2',
        });
        
        // Generate the PDF from the page content
        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            pageRanges: '1',
        });

        return pdfBuffer;

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const certificateCode = searchParams.get('code');

    if (!certificateCode) {
        return NextResponse.json({ error: 'Certificate code is required' }, { status: 400 });
    }

    try {
        const pdfBuffer = await generatePdf(certificateCode, request);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse_Certificate_${certificateCode}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF. An unexpected error occurred on the server.' }, { status: 500 });
    }
}
