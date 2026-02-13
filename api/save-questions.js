// api/save-questions.js

import { put } from '@vercel/blob';

export const config = { runtime: 'edge' }; // optional, faster

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await req.json();

    // Optional: add simple secret check
    const secret = req.headers.get('x-secret');
    if (secret !== 'your-hardcoded-secret-2026') {  // change this!
      return new Response('Unauthorized', { status: 401 });
    }

    await put('questions.json', JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false  // keep same filename
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return new Response('Error saving: ' + err.message, { status: 500 });
  }
}