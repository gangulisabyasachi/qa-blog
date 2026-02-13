// api/save-questions.js

import { put } from '@vercel/blob';

// This forces Node.js runtime (default is Edge in some cases)
export const runtime = 'nodejs';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const data = await req.json();

    // Simple secret check – change this value to something strong & secret!
    const secret = req.headers.get('x-admin-secret');
    if (secret !== 'kolkata-secret-2026-change-me') {
      return new Response('Unauthorized', { status: 401 });
    }

    // Write to Blob (this now works reliably in Node.js runtime)
    await put('questions.json', JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false  // keeps the filename fixed
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}