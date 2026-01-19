import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

// This is the core of the PDF generation logic
async function generatePdf(certificateCode: string, requestUrl: string) {
    let browser;
    try {
        const executablePath = await chrome.executablePath || process.env.PUPPETEER_EXECUTABLE_PATH;

        browser = await puppeteer.launch({
            args: [...chrome.args, '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: executablePath,
            headless: chrome.headless,
        });

        const page = await browser.newPage();
        
        // Construct the full URL to the certificate page for rendering
        const url = new URL(`/certificate/${certificateCode}?pdf=true`, requestUrl);

        // Navigate to the page and wait for it to be fully loaded
        await page.goto(url.toString(), {
            waitUntil: 'networkidle0', // Wait until there are no more than 0 network connections for at least 500 ms.
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
        // Pass the base request URL to construct the absolute path for Puppeteer
        const pdfBuffer = await generatePdf(certificateCode, request.url);

        // Return the PDF as a response
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse_Certificate_${certificateCode}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        // In a real app, you'd want to log this error to a logging service
        return NextResponse.json({ error: 'Failed to generate PDF. An unexpected error occurred on the server.' }, { status: 500 });
    }
}
