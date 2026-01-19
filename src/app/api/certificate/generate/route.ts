import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index.server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { headers } from 'next/headers';

// A4 landscape dimensions in PDF points (72 DPI)
const A4_L_WIDTH = 841.89;
const A4_L_HEIGHT = 595.28;

const getAbsoluteUrl = (path: string) => {
  const host = headers().get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
};


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
        const certificate = docSnap.data();

        // 1. Create a new PDF Document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([A4_L_WIDTH, A4_L_HEIGHT]);
        const { width, height } = page.getSize();

        // 2. Embed fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique); // For signature

        // 3. Draw Background
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(15 / 255, 23 / 255, 42 / 255), // slate-900
        });

        // Colors
        const white = rgb(1, 1, 1);
        const cyan = rgb(34 / 255, 211 / 255, 238 / 255);
        const gray = rgb(203 / 255, 213 / 255, 225 / 255);

        // 4. Draw Content (approximating layout from CSS)
        const titleText = 'CERTIFICATE OF COMPLETION';
        const titleFontSize = 18;
        const titleWidth = helvetica.widthOfTextAtSize(titleText, titleFontSize);
        page.drawText(titleText, {
            x: width / 2 - titleWidth / 2,
            y: height - 100,
            font: helvetica,
            size: titleFontSize,
            color: cyan,
            letterSpacing: 3,
        });

        const certifyText = 'This is to certify that';
        const certifyFontSize = 16;
        const certifyWidth = helvetica.widthOfTextAtSize(certifyText, certifyFontSize);
        page.drawText(certifyText, {
            x: width / 2 - certifyWidth / 2,
            y: height - 180,
            font: helvetica,
            size: certifyFontSize,
            color: gray,
        });
        
        const studentName = certificate.studentName || 'Student Name';
        const studentNameFontSize = 60;
        const studentNameWidth = helveticaBold.widthOfTextAtSize(studentName, studentNameFontSize);
        page.drawText(studentName, {
            x: width / 2 - studentNameWidth / 2,
            y: height - 250,
            font: helveticaBold,
            size: studentNameFontSize,
            color: white,
        });

        const completedText = 'has successfully completed the course';
        const completedFontSize = 16;
        const completedWidth = helvetica.widthOfTextAtSize(completedText, completedFontSize);
        page.drawText(completedText, {
            x: width / 2 - completedWidth / 2,
            y: height - 290,
            font: helvetica,
            size: completedFontSize,
            color: gray,
        });

        const courseName = certificate.courseName || 'Course Name';
        const courseNameFontSize = 24;
        const courseNameWidth = helveticaBold.widthOfTextAtSize(courseName, courseNameFontSize);
        page.drawText(courseName, {
            x: width / 2 - courseNameWidth / 2,
            y: height - 330,
            font: helveticaBold,
            size: courseNameFontSize,
            color: cyan,
        });

        // 5. Generate and Draw QR Code
        const qrUrl = getAbsoluteUrl(`/verify-certificate?code=${certificateCode}`);
        const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
            type: 'png',
            errorCorrectionLevel: 'H',
            margin: 1,
            color: { dark: '#0F172A', light: '#FFFFFF' },
            width: 120,
        });

        const qrImage = await pdfDoc.embedPng(qrPngBuffer);
        const qrSize = 100;
        page.drawImage(qrImage, {
            x: width / 2 - qrSize / 2,
            y: height - 450,
            width: qrSize,
            height: qrSize,
        });


        // 6. Draw Footer
        const footerY = 80;
        const footerFontSize = 10;

        const issueDate = certificate.issueDate.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        page.drawText('ISSUE DATE', { x: 50, y: footerY + 20, font: helveticaBold, size: footerFontSize, color: gray });
        page.drawText(issueDate, { x: 50, y: footerY, font: helvetica, size: footerFontSize, color: white });
        
        page.drawText('CERTIFICATE ID', { x: 50, y: footerY - 30, font: helveticaBold, size: footerFontSize, color: gray });
        page.drawText(certificateCode, { x: 50, y: footerY - 50, font: helvetica, size: footerFontSize, color: white });

        const signatureText = 'Avik Maji';
        const signatureWidth = helveticaOblique.widthOfTextAtSize(signatureText, 24);
        page.drawText(signatureText, { x: width - signatureWidth - 50, y: footerY + 5, font: helveticaOblique, size: 24, color: white });
        
        const founderText = 'Founder, CourseVerse';
        const founderWidth = helvetica.widthOfTextAtSize(founderText, footerFontSize);
        page.drawText(founderText, { x: width - founderWidth - 50, y: footerY - 10, font: helvetica, size: footerFontSize, color: gray });
        
        page.drawLine({
            start: { x: width - founderWidth - 50, y: footerY },
            end: { x: width - 50, y: footerY },
            thickness: 0.5,
            color: gray,
        })

        const pdfBytes = await pdfDoc.save();

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
