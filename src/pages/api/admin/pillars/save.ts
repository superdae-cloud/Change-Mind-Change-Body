import type { APIRoute } from 'astro';
import { putFile } from '../../../../lib/github';

export const prerender = false;

const PILLAR_SLUGS = [
  'exercise',
  'diet',
  'supplements',
  'mental-health',
  'immune-health',
  'bro-science',
] as const;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const pillars = PILLAR_SLUGS.map((slug) => ({
    slug,
    title: String(form.get(`title_${slug}`) ?? '').trim(),
    emoji: String(form.get(`emoji_${slug}`) ?? '').trim(),
    blurb: String(form.get(`blurb_${slug}`) ?? '').trim(),
    color: String(form.get(`color_${slug}`) ?? '').trim(),
  }));

  if (pillars.some((p) => !p.title || !p.emoji || !p.blurb || !p.color)) {
    return redirect(`/admin/pillars?error=${encodeURIComponent('All fields are required.')}`);
  }

  try {
    await putFile('src/data/pillars.json', `${JSON.stringify(pillars, null, 2)}\n`, 'Update pillar cards');
  } catch (err) {
    return redirect(`/admin/pillars?error=${encodeURIComponent(`Failed to save: ${(err as Error).message}`)}`);
  }

  return redirect('/admin/pillars?saved=1');
};
