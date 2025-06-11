import { redirect } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase';

function randomString(length: number): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-~_';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export const load = async (event) => {
	if (!event.locals.session) throw redirect(303, '/auth/login');

	const supabase = createSupabaseServerClient(event);

	const hash = randomString(20);
	const email = event.locals.user?.email ?? 'guest@unknown.com';

	const formData = [
		{
			id: 1,
			title: 'Section Title',
			description: 'This is the first section',
			items: []
		}
	];

	const { error } = await supabase
		.from('forms')
		.insert({
			form_hash: hash,
			form_data: formData,
			creator_email: email,
            formCloseTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
		});

	if (error) {
		console.error('Form creation failed', error);
		throw redirect(303, '/error');
	}

	// 🚀 redirect to /create/<hash>
	throw redirect(303, `/create/${hash}`);
};
