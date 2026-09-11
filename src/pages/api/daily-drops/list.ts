import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

export const GET: APIRoute = async () => {
  const store = getStore("daily-drops-submissions");
  const { blobs } = await store.list();

  const submissions = await Promise.all(
    blobs.map((entry) => store.get(entry.key, { type: "json" })),
  );

  const approved = submissions
    .filter((s): s is any => !!s && s.status === "approved")
    .sort((a, b) => (b.submittedAt as string).localeCompare(a.submittedAt as string))
    .map((s) => ({
      id: s.id,
      name: s.name,
      story: s.story,
      imageUrl: s.imageFilename ? `/api/daily-drops/images/${s.imageFilename}` : null,
      videoUrl: s.videoUrl,
      submittedAt: s.submittedAt,
    }));

  return new Response(JSON.stringify(approved), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
