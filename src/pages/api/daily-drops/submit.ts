import type { APIRoute } from "astro";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStore } from "@netlify/blobs";

export const prerender = false;

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const MAX_STORY_LENGTH = 2000;
const ALLOWED_VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "vimeo.com",
  "www.vimeo.com",
]);

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function normalizeVideoUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!ALLOWED_VIDEO_HOSTS.has(url.hostname)) return null;
  return url.toString();
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected multipart/form-data", 400);
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  const story = String(formData.get("story") ?? "").trim().slice(0, MAX_STORY_LENGTH);
  const videoUrlRaw = String(formData.get("videoUrl") ?? "").trim();
  const photo = formData.get("photo");

  let videoUrl: string | null = null;
  if (videoUrlRaw) {
    videoUrl = normalizeVideoUrl(videoUrlRaw);
    if (!videoUrl) {
      return jsonError(
        "Video link must be a YouTube, Instagram, TikTok, or Vimeo URL",
        400,
      );
    }
  }

  let imageFilename: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(photo.type)) {
      return jsonError(`Unsupported photo type: ${photo.type || "unknown"}`, 415);
    }
    if (photo.size > MAX_INPUT_BYTES) {
      return jsonError(`Photo exceeds ${MAX_INPUT_BYTES / 1024 / 1024}MB limit`, 413);
    }

    const inputBuffer = Buffer.from(await photo.arrayBuffer());
    let outputBuffer: Buffer;
    try {
      outputBuffer = await sharp(inputBuffer, { limitInputPixels: 268402689 })
        .rotate()
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return jsonError("Could not process photo", 422);
    }

    imageFilename = `${createHash("sha256").update(outputBuffer).digest("hex")}.webp`;
    const arrayBuffer = outputBuffer.buffer.slice(
      outputBuffer.byteOffset,
      outputBuffer.byteOffset + outputBuffer.byteLength,
    ) as ArrayBuffer;

    const imageStore = getStore("daily-drops-images");
    await imageStore.set(imageFilename, arrayBuffer, {
      metadata: { contentType: "image/webp" },
    });
  }

  if (!story && !imageFilename && !videoUrl) {
    return jsonError("Add a story, a photo, or a video link", 400);
  }

  const id = randomUUID();
  const submission = {
    id,
    name: name || "Anonymous",
    story,
    imageFilename,
    videoUrl,
    status: "pending" as const,
    submittedAt: new Date().toISOString(),
  };

  const submissionsStore = getStore("daily-drops-submissions");
  await submissionsStore.setJSON(id, submission);

  return new Response(JSON.stringify({ id, status: "pending" }), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
};
