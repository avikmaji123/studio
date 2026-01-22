
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Define a shared secret key. In a real production app, this would be an environment variable.
const PDF_GENERATION_SECRET = 'COURSEVERSE_PDF_SECRET_KEY_2024';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const secret = searchParams.get('secret');

    if (secret !== PDF_GENERATION_SECRET) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!code) {
        return new NextResponse(JSON.stringify({ error: 'Certificate code is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Construct the URL to the dedicated PDF render page
    const renderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}/pdf-render/${code}`;

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Recommended for containerized environments
            ],
        });
        const page = await browser.newPage();
        
        // Use 'networkidle2' which is more reliable than 'networkidle0' in many server environments
        // as it allows for a couple of lingering network requests.
        await page.goto(renderUrl, { waitUntil: 'networkidle2' });

        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            pageRanges: '1',
        });

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse-Certificate-${code}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Puppeteer PDF Generation Error:', error.message);
        // Return a more specific error message to the client for better debugging.
        return new NextResponse(JSON.stringify({ error: `PDF generation failed on server: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
