'use client';

import type { Certificate } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';

type CertificateDisplayProps = {
  certificate: Certificate;
  qrCodeUrl: string;
  // Base64 encoded SVG string for the logo
  qrLogoSvg: string;
};

export function CertificateDisplay({ certificate, qrCodeUrl, qrLogoSvg }: CertificateDisplayProps) {

  return (
    // This container is the single source of truth for the certificate's design.
    // It has a fixed size equivalent to A4 landscape.
    <div className="relative overflow-hidden rounded-lg shadow-2xl dark" style={{ width: 1123, height: 794, background: 'radial-gradient(ellipse at center, #1a2a45 0%, #0f172a 70%)' }}>
      
      {/* Decorative Borders */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-400/30"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-cyan-400/30"></div>
      </div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.5)]"></div>

      {/* Certificate Content */}
      <div className="w-full h-full p-16 flex flex-col text-center text-white font-sans">
        <header className="space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-cyan-400" />
          <p className="font-headline text-2xl tracking-[0.2em] uppercase text-cyan-400/80">
            Certificate of Completion
          </p>
        </header>

        {/* Main content now includes QR code in the flow */}
        <main className="flex-grow flex flex-col justify-center items-center space-y-4 text-center -mt-4">
            <p className="text-xl text-gray-300">This is to certify that</p>
            <h1 className="font-headline text-7xl font-bold text-white tracking-tight">
                {certificate.studentName}
            </h1>
            <p className="text-xl text-gray-300">has successfully completed the course</p>
            <h2 className="font-headline text-3xl font-semibold text-cyan-400 max-w-3xl">
                {certificate.courseName}
            </h2>

            {/* QR Code Container */}
            <div className="!mt-6"> {/* Using !mt-6 to override space-y */}
                 <div className="bg-white p-2 rounded-md shadow-2xl">
                    <QRCodeCanvas
                        value={qrCodeUrl}
                        size={100} // Slightly smaller to give it breathing room
                        bgColor={"#ffffff"}
                        fgColor={"#0F172A"}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: `data:image/svg+xml;base64,${qrLogoSvg}`,
                            height: 20, // Scaled down
                            width: 20,  // Scaled down
                            excavate: true,
                        }}
                    />
                </div>
            </div>
        </main>
        
        <footer className="flex justify-between items-end text-sm z-10">
            <div className="text-left text-gray-300 space-y-4">
                <div>
                    <p className="font-bold text-gray-400 tracking-wider">ISSUE DATE</p>
                    <p className="text-base">{certificate.issueDate.toDate ? format(certificate.issueDate.toDate(), 'MMMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                    <p className="font-bold text-gray-400 tracking-wider">CERTIFICATE ID</p>
                    <p className="font-mono tracking-widest text-base">{certificate.certificateCode}</p>
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
