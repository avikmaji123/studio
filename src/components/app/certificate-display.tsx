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
      // All styles are self-contained to avoid theme conflicts.
      <div
        ref={ref}
        id="certificate-canvas"
        className="relative overflow-hidden font-sans" // Removed 'dark' to be independent of theme context
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          background: 'radial-gradient(ellipse at center, #1a2a45 0%, #0f172a 70%)',
          color: '#ffffff', // Explicitly set text color
        }}
      >
        {/* Decorative Borders */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-400/30"></div>
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-cyan-400/30"></div>
        </div>
        
        {/* Vignette Effect - using a box-shadow to be print-safe */}
        <div className="absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.5)]"></div>

        {/* Certificate Content */}
        <div className="w-full h-full p-16 flex flex-col text-center">
          <header className="space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-cyan-400" />
            <p className="font-headline text-2xl tracking-[0.2em] uppercase text-cyan-400/80">
              Certificate of Completion
            </p>
          </header>

          <main className="flex-grow flex flex-col justify-center items-center space-y-4 text-center -mt-4">
              <p className="text-xl text-gray-300">This is to certify that</p>
              <h1 className="font-headline text-7xl font-bold text-white tracking-tight">
                  {certificate.studentName}
              </h1>
              <p className="text-xl text-gray-300">has successfully completed the course</p>
              <h2 className="font-headline text-3xl font-semibold text-cyan-400 max-w-3xl">
                  {certificate.courseName}
              </h2>

              <div className="!mt-2 font-headline text-lg tracking-widest uppercase text-cyan-400/60">
                {(certificate.courseLevel || 'All Levels').toUpperCase()} LEVEL
              </div>
          </main>
          
          <footer className="flex justify-between items-end text-sm z-10">
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

              {/* QR Code in its own flex container for centering and ensuring it is part of the flow */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2" data-testid="qr-code-container">
                   <div className="bg-white p-2 rounded-md shadow-2xl">
                      <QRCodeCanvas
                          value={qrCodeUrl}
                          size={120} // Exact size as required
                          bgColor={"#ffffff"}
                          fgColor={"#0F172A"} // Dark foreground for high contrast
                          level={"H"} // High error correction
                          includeMargin={false}
                          imageSettings={{
                              src: `data:image/svg+xml;base64,${qrLogoSvg}`,
                              height: 24, // Approx 20% of 120
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
      </div>
    );
  }
);

CertificateDisplay.displayName = 'CertificateDisplay';
