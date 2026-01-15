'use server';

import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { headers } from 'next/headers';
import type { LogEntry } from './types';

// Ensure Firebase is initialized on the server
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
}

const db = getFirestore(firebaseApp);

type LogPayload = Omit<LogEntry, 'id' | 'timestamp' | 'metadata'> & {
    metadata?: Partial<LogEntry['metadata']>;
};

/**
 * Creates a log entry in the Firestore database.
 * This is a server action and should only be called from server components or other server actions.
 */
export async function createLogEntry(payload: LogPayload) {
    try {
        const headersList = headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        await addDoc(collection(db, 'logs'), {
            ...payload,
            timestamp: serverTimestamp(),
            metadata: {
                ...payload.metadata,
                ip,
            },
        });
    } catch (error) {
        console.error('Failed to create log entry:', error);
        // We don't throw here to avoid breaking the user-facing action that triggered the log.
    }
}
