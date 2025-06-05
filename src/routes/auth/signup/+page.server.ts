// src/routes/signup/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required.' });
		}

		const { error } = await locals.supabase.auth.signUp({ email, password });

		if (error) {
			console.error('Signup error:', error); // <--- add this line
			return fail(400, { message: error.message });
		}

		return { message: 'Check your email to verify your account.' };
	}
};
