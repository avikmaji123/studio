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
    // A4 Landscape at 96 DPI
    const CERTIFICATE_WIDTH = 1123;
    const CERTIFICATE_HEIGHT = 794;

    const logoUrl = '/icon.svg'; // Assuming a logo exists in public folder

    return (
      <div
        id="certificate-container"
        className="text-white"
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          fontFamily: 'Lexend, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, hsl(224, 71%, 4%), hsl(222, 47%, 11%))',
          printColorAdjust: 'exact',
        }}
      >
        {/* Decorative Accents */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '1rem', background: 'linear-gradient(to bottom, hsl(199, 94%, 60%), hsl(180, 80%, 40%))' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '1rem', background: 'linear-gradient(to top, hsl(199, 94%, 60%), hsl(180, 80%, 40%))' }}></div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 64, width: '100%', textAlign: 'center' }}>
            <BookOpen style={{ height: 48, width: 48, margin: '0 auto', color: 'hsl(199, 94%, 60%)' }} />
            <p style={{ fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'hsla(0, 0%, 100%, 0.8)', marginTop: '1rem' }}>
                Certificate of Completion
            </p>
        </div>

        {/* Main Content */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', color: '#E5E7EB' }}>This is to certify that</p>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 700, fontSize: '4.5rem', margin: '0.5rem 0', letterSpacing: '-0.025em' }}>
                {certificate.studentName}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#E5E7EB' }}>has successfully completed the course</p>
            <h2 style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 600, fontSize: '2.25rem', color: 'hsl(199, 94%, 60%)', marginTop: '0.5rem' }}>
                {certificate.courseName}
            </h2>
            <p style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: '1.125rem', color: 'hsla(0, 0%, 100%, 0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1rem' }}>
                {certificate.courseLevel || 'All Levels'}
            </p>
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 64, width: '100%', paddingLeft: 64, paddingRight: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left Section */}
            <div style={{ textAlign: 'left', color: '#E5E7EB', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Issue Date</p>
                <p style={{ marginTop: '0.25rem', fontSize: '1rem' }}>{certificate.issueDate?.toDate ? format(certificate.issueDate.toDate(), 'MMMM d, yyyy') : 'N/A'}</p>
                <p style={{ fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '1rem' }}>Certificate ID</p>
                <p style={{ marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.05em' }}>{certificate.certificateCode}</p>
            </div>

            {/* Center Section (QR Code) */}
            <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)' }}>
                 <div style={{ position: 'relative', width: 120, height: 120 }}>
                    {qrCodeDataUrl ? (
                      <>
                        <Image src={qrCodeDataUrl} alt="QR Code for verification" layout="fill" objectFit="contain" />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 30,
                            height: 30,
                            background: 'hsl(222, 47%, 11%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            padding: '4px'
                        }}>
                           <BookOpen style={{ color: 'white', width: '100%', height: '100%' }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ width: 120, height: 120, background: '#374151', borderRadius: '4px' }}></div>
                    )}
                 </div>
            </div>

            {/* Right Section */}
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2.5rem', color: '#E5E7EB' }}>Avik Maji</p>
                <hr style={{ borderTop: '1px solid #9CA3AF', width: '100%', margin: '4px 0' }}/>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', letterSpacing: '0.1em' }}>Founder, CourseVerse</p>
            </div>
        </div>
      </div>
    );
};
