import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Filenames are content-addressed (sha256 of the webp bytes) — anything
// that doesn't match this shape isn't a file we ever wrote, so reject it
// outright rather than letting it near the filesystem.
const FILENAME_PATTERN = /^[a-f0-9]{64}\.webp$/;

export const GET: APIRoute = async ({ params }) => {
  const file = params.file ?? '';
  if (!FILENAME_PATTERN.test(file)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(UPLOADS_DIR, file));
    return new Response(buffer, {
      status: 200,
      headers: {
        'content-type': 'image/webp',
        // safe to cache forever: filename is a hash of the content
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
