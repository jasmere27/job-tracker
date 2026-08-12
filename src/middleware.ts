import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase/server';

const PUBLIC_PATHS = new Set(['/login', '/api/auth/callback']);

export const onRequest = defineMiddleware(async (context, next) => {
	const supabase = createSupabaseServerClient(context.request, context.cookies);

	const {
		data: { user }
	} = await supabase.auth.getUser();

	context.locals.user = user;

	if (!user && !PUBLIC_PATHS.has(context.url.pathname)) {
		return context.redirect('/login');
	}

	if (user && context.url.pathname === '/login') {
		return context.redirect('/');
	}

	return next();
});
