import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any)?.netlify?.context?.clientContext?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Login required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore("daily-drops-submissions");
  const { blobs } = await store.list();
  const submissions = await Promise.all(
    blobs.map((entry) => store.get(entry.key, { type: "json" })),
  );

  const sorted = submissions
    .filter((s): s is any => !!s)
    .sort((a, b) => (b.submittedAt as string).localeCompare(a.submittedAt as string))
    .map((s) => ({
      ...s,
      imageUrl: s.imageFilename ? `/api/daily-drops/images/${s.imageFilename}` : null,
    }));

  return new Response(JSON.stringify(sorted), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
