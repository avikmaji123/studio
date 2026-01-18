'use server';

import { cache } from 'react';

// Using React's cache function to prevent re-fetching the same font multiple times per request.
export const getFont = cache(async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font from ${url}: ${response.statusText}`);
  }
  return response.arrayBuffer();
});
