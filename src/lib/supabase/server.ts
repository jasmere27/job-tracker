import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './types';

export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
	return createServerClient<Database>(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return parseCookieHeader(request.headers.get('Cookie') ?? '').filter(
					(cookie): cookie is { name: string; value: string } => cookie.value !== undefined
				);
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, options);
				});
			}
		}
	});
}
