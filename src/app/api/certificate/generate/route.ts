import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server'; 
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import type { Certificate } from '@/lib/types';
import { headers } from 'next/headers';
import { getFont } from '@/lib/fonts';

// --- A4 paper dimensions in points (72 points per inch) ---
const A4_LANDSCAPE_WIDTH = 841.89;
const A4_LANDSCAPE_HEIGHT = 595.28;

async function generatePdf(certificate: Certificate) {
    // --- Font fetching ---
    const [
        lexendRegularFontBytes,
        lexendBoldFontBytes,
        sourceSansRegularFontBytes,
        dancingScriptBoldFontBytes
    ] = await Promise.all([
        getFont('https://fonts.gstatic.com/s/lexend/v17/ir_UiQkyD0sYWtM81g.ttf'),
        getFont('https://fonts.gstatic.com/s/lexend/v17/ir_XQkyD0sYWtM8uGtr-KA.ttf'),
        getFont('https://fonts.gstatic.com/s/sourcesans3/v15/nwpStKy2OAdR1K-IwhWudF-R3w.ttf'),
        getFont('https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9-Yg.ttf'),
    ]);
    
    // --- Create a new PDF Document ---
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT]);
    
    // --- Embed Fonts ---
    const lexendRegularFont = await pdfDoc.embedFont(lexendRegularFontBytes);
    const lexendBoldFont = await pdfDoc.embedFont(lexendBoldFontBytes);
    const sourceSansRegularFont = await pdfDoc.embedFont(sourceSansRegularFontBytes);
    const dancingScriptBoldFont = await pdfDoc.embedFont(dancingScriptBoldFontBytes);

    // --- Colors ---
    const colors = {
        white: rgb(1, 1, 1),
        cyan: rgb(0.13, 0.76, 0.83),
        gray: rgb(0.82, 0.83, 0.85),
        darkBlue: rgb(0.06, 0.09, 0.16)
    };

    // --- Draw Background ---
    // pdf-lib doesn't support gradients, so we use a solid dark color.
    page.drawRectangle({
        x: 0,
        y: 0,
        width: A4_LANDSCAPE_WIDTH,
        height: A4_LANDSCAPE_HEIGHT,
        color: colors.darkBlue,
    });

    // --- Draw Decorative Borders ---
    const BORDER_WIDTH = 20;
    const BORDER_COLOR = rgb(0.1, 0.2, 0.4); // A darker, subtle blue
    page.drawRectangle({ x: 0, y: 0, width: BORDER_WIDTH, height: A4_LANDSCAPE_HEIGHT, color: BORDER_COLOR });
    page.drawRectangle({ x: A4_LANDSCAPE_WIDTH - BORDER_WIDTH, y: 0, width: BORDER_WIDTH, height: A4_LANDSCAPE_HEIGHT, color: BORDER_COLOR });
    
    const contentWidth = A4_LANDSCAPE_WIDTH - 140; // Margins of 70 on each side
    const centerX = A4_LANDSCAPE_WIDTH / 2;

    // --- Draw "Certificate of Completion" ---
    page.drawText('Certificate of Completion', {
        x: centerX - lexendRegularFont.widthOfTextAtSize('Certificate of Completion', 20) / 2,
        y: 480,
        font: lexendRegularFont,
        size: 20,
        color: colors.cyan,
    });

    // --- Draw Main Content ---
    page.drawText('This is to certify that', {
        x: centerX - sourceSansRegularFont.widthOfTextAtSize('This is to certify that', 16) / 2,
        y: 430,
        font: sourceSansRegularFont,
        size: 16,
        color: colors.gray,
    });

    page.drawText(certificate.studentName, {
        x: centerX - lexendBoldFont.widthOfTextAtSize(certificate.studentName, 48) / 2,
        y: 360,
        font: lexendBoldFont,
        size: 48,
        color: colors.white,
    });

    page.drawText('has successfully completed the course', {
        x: centerX - sourceSansRegularFont.widthOfTextAtSize('has successfully completed the course', 16) / 2,
        y: 330,
        font: sourceSansRegularFont,
        size: 16,
        color: colors.gray,
    });
    
    page.drawText(certificate.courseName, {
        x: centerX - lexendBoldFont.widthOfTextAtSize(certificate.courseName, 28) / 2,
        y: 280,
        font: lexendBoldFont,
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
        color: { dark: '#0F172A', light: '#FFFFFF' },
    });
    
    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrImage, {
        x: centerX - qrImage.width / 2,
        y: 140,
        width: 120,
        height: 120,
    });

    // --- Draw Footer Content ---
    const footerY = 80;
    const marginX = 70;
    
    // Bottom Left
    page.drawText('Issue Date', { x: marginX, y: footerY + 20, font: lexendBoldFont, size: 10, color: colors.gray });
    page.drawText(format(certificate.issueDate.toDate(), 'MMMM d, yyyy'), { x: marginX, y: footerY, font: sourceSansRegularFont, size: 12, color: colors.white });
    
    page.drawText('Certificate ID', { x: marginX, y: footerY - 30, font: lexendBoldFont, size: 10, color: colors.gray });
    page.drawText(certificate.certificateCode, { x: marginX, y: footerY - 45, font: sourceSansRegularFont, size: 12, color: colors.white });

    // Bottom Right (Signature)
    const signatureText = 'Avik Maji';
    const signatureWidth = dancingScriptBoldFont.widthOfTextAtSize(signatureText, 32);
    const signatureX = A4_LANDSCAPE_WIDTH - marginX - signatureWidth;
    
    page.drawText(signatureText, { x: signatureX, y: footerY + 5, font: dancingScriptBoldFont, size: 32, color: colors.white });
    page.drawLine({
        start: { x: signatureX, y: footerY },
        end: { x: A4_LANDSCAPE_WIDTH - marginX, y: footerY },
        thickness: 1,
        color: colors.gray,
    });
    page.drawText('Founder, CourseVerse', {
        x: signatureX + (signatureWidth - lexendRegularFont.widthOfTextAtSize('Founder, CourseVerse', 10))/2,
        y: footerY - 15,
        font: lexendRegularFont,
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
