import type { APIRoute } from 'astro';
import { putFile } from '../../../../lib/github';
import { PAGE_FIELDS } from '../../../../lib/pageFields';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const page = String(form.get('page') ?? '');
  const fields = PAGE_FIELDS[page];

  if (!fields) {
    return redirect('/admin');
  }

  const data: Record<string, string> = {};
  for (const field of fields) {
    data[field.name] = String(form.get(field.name) ?? '').trim();
  }

  if (Object.values(data).some((v) => !v)) {
    return redirect(`/admin/pages/${page}?error=${encodeURIComponent('All fields are required.')}`);
  }

  try {
    await putFile(`src/content/pages/${page}.json`, `${JSON.stringify(data, null, 2)}\n`, `Update ${page} page copy`);
  } catch (err) {
    return redirect(`/admin/pages/${page}?error=${encodeURIComponent(`Failed to save: ${(err as Error).message}`)}`);
  }

  return redirect(`/admin/pages/${page}?saved=1`);
};
