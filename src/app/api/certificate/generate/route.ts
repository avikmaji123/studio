import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server'; 
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import type { Certificate } from '@/lib/types';
import { headers } from 'next/headers';

// --- A4 paper dimensions in points (72 points per inch) ---
const A4_LANDSCAPE_WIDTH = 841.89;
const A4_LANDSCAPE_HEIGHT = 595.28;

async function generatePdf(certificate: Certificate) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT]);

    // --- Embed Standard Fonts (more reliable on server) ---
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const scriptFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // --- Colors ---
    const colors = {
        white: rgb(1, 1, 1),
        cyan: rgb(0.13, 0.76, 0.83),
        gray: rgb(0.82, 0.83, 0.85),
        darkBlue: rgb(0.06, 0.09, 0.16)
    };

    // --- Draw Background Gradient (Simplified for pdf-lib) ---
    // pdf-lib doesn't support gradients directly, so we use a solid dark color
    page.drawRectangle({
        x: 0,
        y: 0,
        width: A4_LANDSCAPE_WIDTH,
        height: A4_LANDSCAPE_HEIGHT,
        color: colors.darkBlue,
    });

    // --- Draw Decorative Borders ---
    const BORDER_WIDTH = 5;
    page.drawRectangle({ x: 0, y: 0, width: BORDER_WIDTH, height: A4_LANDSCAPE_HEIGHT, color: colors.cyan, opacity: 0.3 });
    page.drawRectangle({ x: A4_LANDSCAPE_WIDTH - BORDER_WIDTH, y: 0, width: BORDER_WIDTH, height: A4_LANDSCAPE_HEIGHT, color: colors.cyan, opacity: 0.3 });
    
    const centerX = A4_LANDSCAPE_WIDTH / 2;

    // --- Header ---
    page.drawText('CERTIFICATE OF COMPLETION', {
        x: centerX - regularFont.widthOfTextAtSize('CERTIFICATE OF COMPLETION', 20) / 2,
        y: 480,
        font: regularFont,
        size: 20,
        color: colors.cyan,
        letterSpacing: 2,
    });

    // --- Main Content ---
    page.drawText('This is to certify that', {
        x: centerX - italicFont.widthOfTextAtSize('This is to certify that', 16) / 2,
        y: 430,
        font: italicFont,
        size: 16,
        color: colors.gray,
    });

    page.drawText(certificate.studentName, {
        x: centerX - boldFont.widthOfTextAtSize(certificate.studentName, 48) / 2,
        y: 360,
        font: boldFont,
        size: 48,
        color: colors.white,
    });

    page.drawText('has successfully completed the course', {
        x: centerX - italicFont.widthOfTextAtSize('has successfully completed the course', 16) / 2,
        y: 330,
        font: italicFont,
        size: 16,
        color: colors.gray,
    });
    
    page.drawText(certificate.courseName, {
        x: centerX - boldFont.widthOfTextAtSize(certificate.courseName, 28) / 2,
        y: 280,
        font: boldFont,
        size: 28,
        color: colors.cyan,
    });

    // --- Generate and Embed QR Code ---
    const host = headers().get('host') || 'courseverse.com';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const qrCodeContent = `${protocol}://${host}/verify-certificate?code=${certificate.certificateCode}`;
    
    const qrDataUrl = await QRCode.toDataURL(qrCodeContent, {
        errorCorrectionLevel: 'H',
        width: 120,
        margin: 1,
        color: {
            dark: '#0F172A',
            light: '#FFFFFF', // Use a solid white background
        },
    });
    
    const qrPngBytes = Buffer.from(qrDataUrl.substring(qrDataUrl.indexOf(',') + 1), 'base64');
    const qrImage = await pdfDoc.embedPng(qrPngBytes);
    
    page.drawImage(qrImage, {
        x: centerX - qrImage.width / 2,
        y: 140,
        width: 120,
        height: 120,
    });

    // --- Footer Content ---
    const footerY = 80;
    const marginX = 70;
    
    // Left side
    page.drawText('Issue Date', { x: marginX, y: footerY + 20, font: boldFont, size: 10, color: colors.gray });
    page.drawText(format(certificate.issueDate.toDate(), 'MMMM d, yyyy'), { x: marginX, y: footerY, font: regularFont, size: 12, color: colors.white });
    
    page.drawText('Certificate ID', { x: marginX, y: footerY - 30, font: boldFont, size: 10, color: colors.gray });
    page.drawText(certificate.certificateCode, { x: marginX, y: footerY - 45, font: regularFont, size: 12, color: colors.white });

    // Right side
    const signatureText = 'Avik Maji';
    const signatureWidth = scriptFont.widthOfTextAtSize(signatureText, 32);
    const signatureX = A4_LANDSCAPE_WIDTH - marginX - signatureWidth;
    
    page.drawText(signatureText, { x: signatureX, y: footerY + 5, font: scriptFont, size: 32, color: colors.white });
    page.drawLine({
        start: { x: signatureX - 10, y: footerY },
        end: { x: A4_LANDSCAPE_WIDTH - marginX, y: footerY },
        thickness: 1,
        color: colors.gray,
    });
    page.drawText('Founder, CourseVerse', {
        x: signatureX + (signatureWidth - regularFont.widthOfTextAtSize('Founder, CourseVerse', 10))/2,
        y: footerY - 15,
        font: regularFont,
        size: 10,
        color: colors.gray,
    });

    return await pdfDoc.save();
}


export async function POST(req: NextRequest) {
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

        const certificate = docSnap.data() as Certificate;

        const pdfBytes = await generatePdf(certificate);

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CourseVerse_Certificate_${certificateCode}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('PDF Generation API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred during PDF generation.' }, { status: 500 });
    }
}
