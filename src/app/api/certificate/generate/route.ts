
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            console.error('PDF Generation Error: Missing certificate code in request body.');
            return NextResponse.json({ error: 'Missing certificate code' }, { status: 400 });
        }

        // Dynamically construct the URL to prevent localhost issues in serverless env
        const host = req.headers.get('host');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const url = `${protocol}://${host}/certificate/${code}`;
        
        const browser = await puppeteer.launch({ 
            headless: true,
            // Optimized args for serverless environments
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ] 
        });

        const page = await browser.newPage();
        
        // Navigate to the page and wait for it to be fully loaded
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Also explicitly wait for the QR code to ensure client-side JS has run
        await page.waitForSelector('[data-testid="qr-code-container"]', { timeout: 15000 });
        
        // Generate PDF buffer in memory, do NOT write to a file path
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
        // Log the detailed error on the server for debugging.
        console.error('PDF Generation Error:', error);
        // Return a generic error message to the client.
        return NextResponse.json({ error: 'An unexpected error occurred during PDF generation.' }, { status: 500 });
    }
}
