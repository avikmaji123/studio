'use client';

import React from 'react';
import type { Certificate } from '@/lib/types';
import { BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

type CertificateDisplayProps = {
  certificate: Certificate;
  qrCodeDataUrl: string | null;
};

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificate, qrCodeDataUrl }) => {
    const CERTIFICATE_WIDTH = 1123;
    const CERTIFICATE_HEIGHT = 794;

    return (
      <div
        id="certificate-canvas"
        className="relative font-sans overflow-hidden dark p-16 flex flex-col text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white"
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          fontFamily: 'Lexend, sans-serif'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-400/30"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-cyan-400/30"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.5)]"></div>

        {/* Header */}
        <header className="space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-cyan-400" />
          <p className="font-headline text-2xl tracking-[0.2em] uppercase text-cyan-400/80">
            Certificate of Completion
          </p>
        </header>

        {/* Main Content (Vertically Centered) */}
        <main className="flex-grow flex flex-col justify-center items-center text-center space-y-2">
            <p className="text-xl text-gray-300">This is to certify that</p>
            <h1 style={{fontFamily: 'Lexend, sans-serif', fontWeight: 700}} className="text-7xl font-bold text-white tracking-tight">
                {certificate.studentName}
            </h1>
            <p className="text-xl text-gray-300">has successfully completed the course</p>
            <h2 style={{fontFamily: 'Lexend, sans-serif', fontWeight: 600}} className="text-3xl font-semibold text-cyan-400 max-w-3xl">
                {certificate.courseName}
            </h2>
            <div className="!mt-4 font-headline text-lg tracking-widest uppercase text-cyan-400/60">
              {(certificate.courseLevel || 'All Levels').toUpperCase()} LEVEL
            </div>
        </main>
        
        {/* Footer */}
        <footer className="w-full flex justify-between items-end text-sm z-10">
            {/* Left Section */}
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

             {/* Center Section (QR Code) */}
            <div className="flex-shrink-0">
                 <div className="bg-white p-2 rounded-md shadow-2xl">
                    {qrCodeDataUrl ? (
                      <Image src={qrCodeDataUrl} alt="QR Code" width={120} height={120} />
                    ) : (
                      <div className="w-[120px] h-[120px] bg-gray-300 animate-pulse"></div>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="text-center">
                <p style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2.25rem' }} className="text-gray-200">Avik Maji</p>
                <hr className="border-t border-gray-400 w-full my-1"/>
                <p className="text-xs text-gray-400 tracking-wider">Founder, CourseVerse</p>
            </div>
        </footer>
      </div>
    );
};
