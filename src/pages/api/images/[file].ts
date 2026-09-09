import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

// Filenames are content-addressed (sha256 of the webp bytes) — anything
// that doesn't match this shape isn't a file we ever wrote, so reject it
// outright rather than looking it up.
const FILENAME_PATTERN = /^[a-f0-9]{64}\.webp$/;

export const GET: APIRoute = async ({ params }) => {
  const file = params.file ?? "";
  if (!FILENAME_PATTERN.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore("uploaded-images");
  const blob = await store.get(file, { type: "arrayBuffer" });
  if (!blob) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob, {
    status: 200,
    headers: {
      "content-type": "image/webp",
      // safe to cache forever: filename is a hash of the content
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
