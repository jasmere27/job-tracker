import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, url, redirect }) => {
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');

	const supabase = createSupabaseServerClient(request, cookies);

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('exchangeCodeForSession failed:', error.message);
			return redirect(`/login?error=${encodeURIComponent(error.message)}`);
		}
		return redirect('/');
	}

	if (tokenHash && type) {
		const { error } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type: type as 'magiclink' | 'email'
		});
		if (error) {
			console.error('verifyOtp failed:', error.message);
			return redirect(`/login?error=${encodeURIComponent(error.message)}`);
		}
		return redirect('/');
	}

	console.error('auth callback hit with no code/token_hash. Query:', url.search);
	return redirect('/login?error=missing_code');
};
