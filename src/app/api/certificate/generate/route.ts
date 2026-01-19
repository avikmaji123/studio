// This server-side API route has been deprecated and replaced with a more stable
// client-side rendering solution using html2canvas and jspdf.
// The new logic can be found in `src/app/certificate/[certificateCode]/page.tsx`.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { error: 'This API route is deprecated. PDF generation is now handled on the client.' },
        { status: 410 } // 410 Gone
    );
}
