// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { message: 'Email and password required.' });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error || !data.session) {
			console.error('Login error:', error);
			return fail(401, { message: error?.message || 'Login failed.' });
		}

		const { user } = data;

		// Check if user exists in your users table
		let { data: existingUser, error: fetchError } = await locals.supabase
			.from('users')
			.select('id, email, full_name')
			.eq('id', user.id)
			.single();

		if (fetchError) {
			console.error('Error fetching user:', fetchError);
			// You might still proceed, or return fail
		}

		// If user doesn't exist, insert them
		if (!existingUser) {
			const { error: insertError } = await locals.supabase.from('users').insert({
				id: user.id,
				email: user.email,
				full_name: user.user_metadata?.full_name || ''
			});

			if (insertError) {
				console.error('Error inserting user:', insertError);
				return fail(500, { message: 'Failed to create user profile.' });
			}

			// Use inserted data for cookie
			existingUser = {
				id: user.id,
				email: user.email,
				full_name: user.user_metadata?.full_name || ''
			};
		}

		// Save user data in cookie (JSON stringified)
		cookies.set(
			'user_data',
			JSON.stringify({
				id: existingUser.id,
				email: existingUser.email,
				full_name: existingUser.full_name ?? ''
			}),
			{
				path: '/',
				httpOnly: false, // so client JS can read it, adjust as needed
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			}
		);

		if (!existingUser.full_name) throw redirect(303, '/profile');
		else throw redirect(303, '/');
	}
};
