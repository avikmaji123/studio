'use client';

import type { Certificate } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';

type CertificateDisplayProps = {
  certificate: Certificate;
  qrCodeUrl: string;
};

export function CertificateDisplay({ certificate, qrCodeUrl }: CertificateDisplayProps) {

  return (
    <div className="certificate-container dark">
      {/* Decorative Borders */}
      <div className="certificate-border">
        <div className="certificate-border-left"></div>
        <div className="certificate-border-right"></div>
      </div>
      
      <div className="certificate-vignette"></div>

      <div className="certificate-body">
        <header className="space-y-2">
          <BookOpen className="h-10 w-10 mx-auto text-cyan-400" />
          <p className="font-headline text-2xl tracking-widest uppercase text-cyan-400/80">
            Certificate of Completion
          </p>
        </header>

        <main className="flex-grow flex flex-col justify-center items-center space-y-4 md:space-y-6 text-center -mt-8">
            <p className="text-lg md:text-xl text-gray-300 font-sans">This is to certify that</p>
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-white tracking-tight">
                {certificate.studentName}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-sans">has successfully completed the course</p>
            <h2 className="font-headline text-2xl md:text-3xl font-semibold text-cyan-400">
                {certificate.courseName}
            </h2>
            {certificate.courseLevel && (
                 <p className="font-semibold uppercase tracking-widest text-gray-400 text-sm md:text-base">
                    {certificate.courseLevel} Level
                </p>
             )}
        </main>
        
        <div className="absolute bottom-[130px] left-1/2 -translate-x-1/2">
            <div className="bg-white p-1 rounded-md shadow-2xl">
                 <QRCodeCanvas
                    value={qrCodeUrl}
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#0F172A"}
                    level={"H"}
                    includeMargin={false}
                 />
            </div>
        </div>

        <footer className="flex justify-between items-end text-sm z-10">
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
