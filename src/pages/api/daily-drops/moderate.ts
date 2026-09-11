import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any)?.netlify?.context?.clientContext?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Login required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { id, action } = body;
  if (!id || (action !== "approve" && action !== "reject")) {
    return new Response(JSON.stringify({ error: 'Body must be { id, action: "approve"|"reject" }' }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const store = getStore("daily-drops-submissions");
  const submission = await store.get(id, { type: "json" });
  if (!submission) {
    return new Response(JSON.stringify({ error: "Submission not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  if (action === "reject") {
    if (submission.imageFilename) {
      await getStore("daily-drops-images").delete(submission.imageFilename);
    }
    await store.delete(id);
  } else {
    await store.setJSON(id, { ...submission, status: "approved" });
  }

  return new Response(JSON.stringify({ id, status: action === "approve" ? "approved" : "rejected" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
