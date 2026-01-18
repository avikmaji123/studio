

'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import type { Certificate } from '@/lib/types';
import { BookOpen, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, useRef } from 'react';

// Make QRCode constructor available from the CDN script
declare var QRCode: any;

async function generateCertificateQR(certificateCode: string, slotElement: HTMLElement | null) {
  try {
    if (!certificateCode) throw new Error("Certificate code missing");
    if (!slotElement) throw new Error("QR slot element not found");

    slotElement.innerHTML = "";

    const verifyUrl =
      window.location.origin +
      "/verify-certificate?code=" +
      encodeURIComponent(certificateCode);

    // Step 1: Create QR
    const qr = new QRCode(slotElement, {
      text: verifyUrl,
      width: 134,
      height: 134,
      colorDark: "#e5e7eb", // light silver (scan-safe)
      colorLight: "#0b1220", // solid dark background
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Step 2: Wait for canvas
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = slotElement.querySelector("canvas");
    if (!canvas) throw new Error("QR canvas not rendered");

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Step 3: Draw logo INTO canvas
    const logo = new Image();
    logo.src = "https://i.ibb.co/Y76Ct8pP/Screenshot-20260118-231138.jpg";
    logo.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve) => {
      logo.onload = () => {
        const logoSize = 32;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(x - 6, y - 6, logoSize + 12, logoSize + 12);
        ctx.drawImage(logo, x, y, logoSize, logoSize);
        resolve();
      };
      
      logo.onerror = () => {
        console.warn("QR logo failed to load. Generating QR without logo.");
        resolve(); // Resolve anyway, so printing can continue
      };
    });

  } catch (err: any) {
    console.error("QR generation error:", err?.message || err);
  }
}

function CertificateDisplay({ certificate }: { certificate: Certificate }) {
    const qrSlotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof QRCode !== 'undefined' && qrSlotRef.current) {
            generateCertificateQR(certificate.certificateCode, qrSlotRef.current);
        }
    }, [certificate.certificateCode]);


    return (
        <div className="certificate-root">
            {/* Watermark */}
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] text-white/5 opacity-75" />

            {/* Header */}
            <div className="text-center z-10">
                <div className="flex justify-center items-center gap-3">
                    <BookOpen className="h-8 w-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider font-headline">CourseVerse</h1>
                </div>
                 <hr className="w-48 mx-auto my-3 border-cyan-400/20" />
            </div>
            
            {/* Main Content */}
            <div className="text-center z-10 -mt-8">
                <p className="font-headline text-5xl tracking-tight text-gray-200 certificate-title">Certificate of Completion</p>
                <p className="text-lg text-gray-400 mt-6 mb-4">This is to certify that</p>
                <p className="font-headline text-6xl font-bold tracking-wider text-white certificate-name">{certificate.studentName}</p>
                <p className="text-lg text-gray-400 mt-4">has successfully completed the course</p>
                <p className="font-headline text-3xl font-semibold text-cyan-400 mt-2 certificate-course">{certificate.courseName}</p>
                 {certificate.courseLevel && <p className="text-base font-semibold uppercase tracking-widest text-gray-500 mt-1">{certificate.courseLevel}</p>}
            </div>

            <div id="certificate-qr-slot" ref={qrSlotRef}></div>

            {/* Footer */}
            <div className="flex justify-between items-end z-10">
                <div className="text-left text-xs font-mono certificate-meta">
                    <p className="font-sans font-bold text-gray-400">ISSUE DATE</p>
                    <p className="text-gray-300">{format(certificate.issueDate.toDate(), 'MMMM d, yyyy')}</p>
                    <p className="font-sans font-bold text-gray-400 mt-2">CERTIFICATE ID</p>
                    <p className="text-gray-300">{certificate.certificateCode}</p>
                </div>
                <div className="certificate-signature">
                  <span className="signature-name">Avik Maji</span>
                  <hr className="w-full my-1 border-gray-600"/>
                  <span className="signature-title">Founder, CourseVerse</span>
                </div>
            </div>
        </div>
    );
}

function InvalidCertificate({ title, message }: { title: string, message: string }) {
    return (
        <div className="certificate-root items-center justify-center text-center">
            <AlertTriangle className="h-24 w-24 text-destructive mb-8" />
            <h1 className="font-headline text-5xl font-bold text-destructive">{title}</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">{message}</p>
            <Button asChild className="mt-8 no-print">
                <Link href="/verify-certificate">Try Again</Link>
            </Button>
        </div>
    );
}


export default function CertificatePage() {
    const params = useParams();
    const code = params.certificateCode as string;
    const firestore = useFirestore();

    const [status, setStatus] = useState<'loading' | 'valid' | 'revoked' | 'invalid'>('loading');
    const [certificate, setCertificate] = useState<Certificate | null>(null);

     const handlePrint = async () => {
        if (!certificate) return;
        
        // Find the on-screen certificate to clone
        const sourceNode = document.querySelector('.certificate-preview-wrapper .certificate-root');
        // Find the container dedicated to printing
        const printContainer = document.getElementById('certificate-print');

        if (!sourceNode || !printContainer) {
            console.error("Required elements for printing are not found.");
            return;
        }
        
        // 1. Clone the rendered certificate content into the print container
        printContainer.innerHTML = sourceNode.outerHTML;

        // 2. Generate a new QR code targeting the cloned element inside the print container
        const newQrSlot = printContainer.querySelector('#certificate-qr-slot') as HTMLElement;
        if (newQrSlot) {
            await generateCertificateQR(certificate.certificateCode, newQrSlot);
        }

        // 3. Add the 'print-mode' class to the body to activate print-specific CSS
        document.body.classList.add('print-mode');
        document.body.classList.remove('preview-mode');
        
        // 4. Trigger the browser's print dialog
        window.print();
        
        // 5. Clean up after the print dialog is closed
        printContainer.innerHTML = '';
        document.body.classList.remove('print-mode');
        document.body.classList.add('preview-mode');
    };

    useEffect(() => {
        // Set default mode on mount
        document.body.classList.add('preview-mode');

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('preview-mode', 'print-mode');
        };
    }, []);


    useEffect(() => {
      if (!firestore || !code) return;
      
      const getCertificate = async () => {
        const certRef = doc(firestore, 'certificates', code);
        try {
          const docSnap = await getDoc(certRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Certificate;
            setCertificate(data);
            setStatus(data.status === 'revoked' ? 'revoked' : 'valid');
          } else {
            setStatus('invalid');
          }
        } catch (error) {
          console.error("Error fetching certificate:", error);
          setStatus('invalid');
        }
      };

      getCertificate();
    }, [firestore, code]);


    const renderContent = () => {
      switch (status) {
        case 'loading':
            return (
                <div className="certificate-root items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            );
        case 'valid':
          return certificate && <CertificateDisplay certificate={certificate} />;
        case 'revoked':
          return <InvalidCertificate title="Certificate Revoked" message="This certificate has been revoked by the administrator and is no longer valid." />;
        case 'invalid':
        default:
          return <InvalidCertificate title="Invalid Certificate" message="The certificate code you are looking for does not exist. Please check the code and try again." />;
      }
    };

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div id="app-controls" className="w-full max-w-5xl flex justify-between items-center mx-auto mb-8">
                <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
                <h2 className="text-lg font-semibold text-foreground">Certificate Preview</h2>
                 <Button onClick={handlePrint} disabled={status !== 'valid'}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PDF
                </Button>
            </div>
            
            <div className="flex justify-center">
                <div className="certificate-preview-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
