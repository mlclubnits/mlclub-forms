// src/routes/profile/+page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import type { User } from '$lib/types'; // your User interface

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const { data: profile, error } = await locals.supabase
		.from('users')
		.select('full_name')
		.eq('id', locals.user.id)
		.single();

	if (error) {
		console.error('Error fetching profile:', error);
	}

	return {
		email: locals.user.email,
		full_name: profile?.full_name ?? ''
	};
};

export const actions = {
	update: async ({ request, locals, cookies }) => {
		if (!locals.user) throw redirect(302, '/login');

		const formData = await request.formData();
		const full_name = formData.get('full_name') as string;

		// Upsert user data with full_name
		const { error } = await locals.supabase.from('users').upsert(
			{
				id: locals.user.id,
				email: locals.user.email, // required
				full_name
			},
			{ onConflict: 'id' }
		);

		if (error) {
			console.error('Update failed:', error);
			return fail(400, { error: error.message });
		}

		// Update the user object saved in cookie to include new full_name
		const updatedUser: User = {
			...locals.user,
			email: locals.user.email ?? '',
			full_name
		};

		// Save updated user object in cookie (JSON stringified)
		cookies.set('user_data', JSON.stringify(updatedUser), {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return { success: true };
	}
};
