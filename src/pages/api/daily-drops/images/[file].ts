import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

const FILENAME_PATTERN = /^[a-f0-9]{64}\.webp$/;

export const GET: APIRoute = async ({ params }) => {
  const file = params.file ?? "";
  if (!FILENAME_PATTERN.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore("daily-drops-images");
  const blob = await store.get(file, { type: "arrayBuffer" });
  if (!blob) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob, {
    status: 200,
    headers: {
      "content-type": "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
