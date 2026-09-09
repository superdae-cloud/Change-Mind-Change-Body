import type { APIRoute } from "astro";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { getStore } from "@netlify/blobs";

export const prerender = false;

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const WEBP_QUALITY = 80;

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected multipart/form-data", 400);
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return jsonError('Missing "image" file field', 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError(`Unsupported file type: ${file.type || "unknown"}`, 415);
  }

  if (file.size > MAX_INPUT_BYTES) {
    return jsonError(
      `File exceeds ${MAX_INPUT_BYTES / 1024 / 1024}MB limit`,
      413,
    );
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer, { limitInputPixels: 268402689 }) // ~16k x 16k, sharp's default
      .rotate() // apply EXIF orientation before stripping metadata
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return jsonError("Could not process image", 422);
  }

  const filename = `${createHash("sha256").update(outputBuffer).digest("hex")}.webp`;

  // Content-addressed storage in Netlify Blobs (replaces the old local-disk
  // write, which doesn't persist across serverless invocations on Netlify).
  // Netlify Blobs' BlobInput type wants a plain ArrayBuffer, not a Node
  // Buffer, so copy out just this buffer's bytes.
  const arrayBuffer = outputBuffer.buffer.slice(
    outputBuffer.byteOffset,
    outputBuffer.byteOffset + outputBuffer.byteLength,
  ) as ArrayBuffer;

  const store = getStore("uploaded-images");
  await store.set(filename, arrayBuffer, {
    metadata: { contentType: "image/webp" },
  });

  return new Response(
    JSON.stringify({
      url: `/api/images/${filename}`,
      filename,
      bytes: outputBuffer.length,
    }),
    { status: 201, headers: { "content-type": "application/json" } },
  );
};
