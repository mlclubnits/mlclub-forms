// src/hooks.server.ts
import { createSupabaseServerClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createSupabaseServerClient(event);

	event.locals.supabase = supabase;

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	event.locals.session = session;
	event.locals.user = user ?? null;

	return resolve(event);
};
