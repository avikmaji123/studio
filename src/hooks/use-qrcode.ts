'use client';
import { useState, useEffect } from 'react';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

interface UseQRCodeProps {
  text: string;
  options?: QRCodeToDataURLOptions;
}

export function useQRCode({ text, options }: UseQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const url = await QRCode.toDataURL(text, options);
        setDataUrl(url);
      } catch (err) {
        setError(err);
        console.error("QR Code Generation Error:", err);
      }
    };

    if (text) {
      generateQrCode();
    }
  }, [text, options]);

  return { dataUrl, error };
}
