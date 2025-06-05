// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.session) throw redirect(303, '/auth/login');

	return {
		user: locals.user
	};
}
