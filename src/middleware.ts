import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!isAdminArea || pathname === '/api/admin/login') {
    return next();
  }

  const authed = verifySessionToken(context.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (authed) {
    return next();
  }

  // The /admin index page renders its own login form for unauthenticated visitors.
  if (pathname === '/admin') {
    return next();
  }

  if (pathname.startsWith('/api/admin')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  return context.redirect('/admin');
});
