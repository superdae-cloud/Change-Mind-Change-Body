import type { APIRoute } from 'astro';
import { deleteFile } from '../../../../lib/github';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const pillar = String(form.get('pillar') ?? '');
  const slug = String(form.get('slug') ?? '');

  if (!pillar || !slug) {
    return redirect('/admin');
  }

  try {
    await deleteFile(`src/content/tips/${pillar}/${slug}.md`, `Delete tip: ${slug}`);
  } catch (err) {
    return redirect(`/admin/tips/${pillar}/${slug}?error=${encodeURIComponent(`Failed to delete: ${(err as Error).message}`)}`);
  }

  return redirect('/admin?deleted=1');
};
