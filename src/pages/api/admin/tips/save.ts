import type { APIRoute } from 'astro';
import matter from 'gray-matter';
import { getFileSha, putFile } from '../../../../lib/github';

export const prerender = false;

const VALID_PILLARS = new Set([
  'exercise',
  'diet',
  'supplements',
  'mental-health',
  'immune-health',
  'bro-science',
]);

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(pillar: string, base: string): Promise<string> {
  let candidate = base || 'tip';
  let n = 2;
  while (await getFileSha(`src/content/tips/${pillar}/${candidate}.md`)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const pillar = String(form.get('pillar') ?? '');
  const originalSlug = String(form.get('originalSlug') ?? '');
  const title = String(form.get('title') ?? '').trim();
  const summary = String(form.get('summary') ?? '').trim();
  const date = String(form.get('date') ?? '');
  const tags = String(form.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const featured = form.get('featured') === '1';
  const draft = form.get('draft') === '1';
  const image = String(form.get('image') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();

  const backTo = `/admin/tips/${pillar}/${originalSlug || 'new'}`;

  if (!VALID_PILLARS.has(pillar) || !title || !summary || !date || !body) {
    return redirect(`${backTo}?error=${encodeURIComponent('All fields except tags and image are required.')}`);
  }

  const isNew = !originalSlug;
  const slug = isNew ? await uniqueSlug(pillar, slugify(title)) : originalSlug;
  const path = `src/content/tips/${pillar}/${slug}.md`;

  const fileContent = matter.stringify(body, {
    title,
    pillar,
    summary,
    date: new Date(`${date}T00:00:00.000Z`),
    tags,
    featured,
    draft,
    ...(image ? { image } : {}),
  });

  try {
    await putFile(path, fileContent, `${isNew ? 'Add' : 'Update'} tip: ${title}`);
  } catch (err) {
    return redirect(`${backTo}?error=${encodeURIComponent(`Failed to save: ${(err as Error).message}`)}`);
  }

  return redirect(`/admin/tips/${pillar}/${slug}?saved=1`);
};
