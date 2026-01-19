'use client';

import React from 'react';
import type { Certificate } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';

type CertificateDisplayProps = {
  certificate: Certificate;
  qrCodeUrl: string;
  qrLogoSvg: string; // Base64 encoded SVG string for the logo
};

// Use forwardRef to pass the ref to the root div for html2canvas to capture.
export const CertificateDisplay = React.forwardRef<HTMLDivElement, CertificateDisplayProps>(
  ({ certificate, qrCodeUrl, qrLogoSvg }, ref) => {
    // Fixed dimensions for the certificate canvas, ensuring a locked aspect ratio and size.
    const CERTIFICATE_WIDTH = 1123;
    const CERTIFICATE_HEIGHT = 794;

    return (
      // This container is the single source of truth for the certificate's design.
      // It has a fixed size and will be captured for the PDF.
      // The background and core layout styles are now on this root element for robust rendering.
      <div
        ref={ref}
        id="certificate-canvas"
        className="relative font-sans overflow-hidden dark p-16 flex flex-col text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white"
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
        }}
      >
        {/* Decorative Borders */}
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-400/30"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-cyan-400/30"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.5)]"></div>

        {/* Certificate Content */}
        <header className="space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-cyan-400" />
          <p className="font-headline text-2xl tracking-[0.2em] uppercase text-cyan-400/80">
            Certificate of Completion
          </p>
        </header>

        {/* Main content area now uses flex-grow to push footer down */}
        <main className="flex-grow flex flex-col justify-center items-center space-y-2">
            <p className="text-xl text-gray-300">This is to certify that</p>
            <h1 className="font-headline text-7xl font-bold text-white tracking-tight">
                {certificate.studentName}
            </h1>
            <p className="text-xl text-gray-300">has successfully completed the course</p>
            <h2 className="font-headline text-3xl font-semibold text-cyan-400 max-w-3xl">
                {certificate.courseName}
            </h2>
            <div className="!mt-4 font-headline text-lg tracking-widest uppercase text-cyan-400/60">
              {(certificate.courseLevel || 'All Levels').toUpperCase()} LEVEL
            </div>
        </main>
        
        {/* Footer now uses a flexbox layout to prevent overlapping elements */}
        <footer className="w-full flex justify-between items-end text-sm z-10">
            <div className="text-left text-gray-300 space-y-4">
                <div>
                    <p className="font-bold text-gray-400 tracking-wider">ISSUE DATE</p>
                    <p className="text-base">{certificate.issueDate?.toDate ? format(certificate.issueDate.toDate(), 'MMMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                    <p className="font-bold text-gray-400 tracking-wider">CERTIFICATE ID</p>
                    <p className="font-mono tracking-widest text-base">{certificate.certificateCode}</p>
                </div>
            </div>

            {/* QR Code is now a flex item in the footer's flow */}
            <div className="flex-shrink-0" data-testid="qr-code-container">
                 <div className="bg-white p-2 rounded-md shadow-2xl">
                    <QRCodeCanvas
                        value={qrCodeUrl}
                        size={120}
                        bgColor={"#ffffff"}
                        fgColor={"#0F172A"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: `data:image/svg+xml;base64,${qrLogoSvg}`,
                            height: 24,
                            width: 24,
                            excavate: true,
                        }}
                    />
                </div>
            </div>

            <div className="text-center">
                <p className="font-signature text-4xl text-gray-200">Avik Maji</p>
                <hr className="border-t border-gray-400 w-full my-1"/>
                <p className="text-xs text-gray-400 tracking-wider">Founder, CourseVerse</p>
            </div>
        </footer>
      </div>
    );
  }
);

CertificateDisplay.displayName = 'CertificateDisplay';
