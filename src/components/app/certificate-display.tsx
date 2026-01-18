'use client';

import type { Certificate } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useQRCode } from '@/hooks/use-qrcode';
import Image from 'next/image';

type CertificateDisplayProps = {
  certificate: Certificate;
  qrCodeUrl: string;
};

export function CertificateDisplay({ certificate, qrCodeUrl }: CertificateDisplayProps) {

  const { dataUrl: qrCodeDataUrl } = useQRCode({
    text: qrCodeUrl,
    options: {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 120,
      color: {
        dark: '#0F172A', // Deep navy
        light: '#00000000', // Transparent
      },
    },
  });

  return (
    <div className="certificate-container">
      {/* Decorative Borders */}
      <div className="certificate-border">
        <div className="certificate-border-left"></div>
        <div className="certificate-border-right"></div>
      </div>
      
      {/* Vignette Overlay */}
      <div className="certificate-vignette"></div>

      <div className="certificate-body">
        <header className="space-y-2">
          <BookOpen className="h-10 w-10 mx-auto text-cyan-400" />
          <p className="font-headline text-2xl tracking-widest uppercase text-cyan-400/80">
            Certificate of Completion
          </p>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center space-y-4 md:space-y-6 text-center">
            <p className="text-lg md:text-xl text-gray-300">This is to certify that</p>
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-white tracking-tight">
                {certificate.studentName}
            </h1>
            <p className="text-lg md:text-xl text-gray-300">has successfully completed the course</p>
            <h2 className="font-headline text-2xl md:text-3xl font-semibold text-cyan-400">
                {certificate.courseName}
            </h2>
             {certificate.courseLevel && (
                 <p className="font-semibold uppercase tracking-widest text-gray-400 text-sm md:text-base">
                    {certificate.courseLevel} Level
                </p>
             )}
             <div className="pt-4">
              {qrCodeDataUrl && (
                  <Image 
                      src={qrCodeDataUrl} 
                      alt="Certificate Verification QR Code"
                      width={120}
                      height={120}
                      className="bg-white p-1 rounded-md"
                  />
              )}
            </div>
        </main>

        <footer className="flex justify-between items-end text-sm">
            <div className="text-left text-gray-300">
                <p className="font-bold text-gray-400">Issue Date</p>
                <p>{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                <p className="font-bold text-gray-400 mt-2">Certificate ID</p>
                <p className="font-mono tracking-widest">{certificate.certificateCode}</p>
            </div>
            <div className="text-center">
                <p className="font-signature text-3xl text-gray-200">Avik Maji</p>
                <hr className="border-t-2 border-gray-400 w-full my-1"/>
                <p className="text-xs text-gray-400">Founder, CourseVerse</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
