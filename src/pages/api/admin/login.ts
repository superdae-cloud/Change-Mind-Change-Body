import type { APIRoute } from 'astro';
import { createSessionToken, verifyCredentials, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  if (!verifyCredentials(username, password)) {
    return redirect('/admin?error=1');
  }

  cookies.set(SESSION_COOKIE_NAME, createSessionToken(username), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return redirect('/admin');
};
