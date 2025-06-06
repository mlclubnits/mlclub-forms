// src/lib/supabase.ts
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_FORMS_SUPABASE_URL, PUBLIC_FORMS_SUPABASE_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

export const createSupabaseServerClient = (event: RequestEvent) => {
	return createServerClient(PUBLIC_FORMS_SUPABASE_URL, PUBLIC_FORMS_SUPABASE_KEY, {
		request: event.request,
		cookies: {
			get: event.cookies.get.bind(event.cookies),
			set: event.cookies.set.bind(event.cookies),
			remove: event.cookies.delete.bind(event.cookies)
		}
	});
};
