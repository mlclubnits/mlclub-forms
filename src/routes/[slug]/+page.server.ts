import { error, fail, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const load: PageServerLoad = async (event) => {
	const slug = event.params.slug;
	if (!slug) {
		throw error(404, 'Form not found');
	}

	const post = await getPostFromDatabase(slug, event);

	if (!post) {
		throw error(404, 'Form not found or expired');
	}

	return {
		form_data: post.form_data,
		form_hash: post.form_hash,
		form_name: post.form_name,
		backgroundSettings: post.backgroundSettings
	};
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		// console.log('first')
		const raw = formData.get('formItems');

		if (!raw || typeof raw !== 'string') {
			return fail(400, { error: 'Missing or invalid formItems JSON' });
		}

		interface ParsedFormItems {
			user: {
				email: string;
				form_hash: string;
			};
			response: unknown[];
		}

		let parsed: ParsedFormItems;
		try {
			parsed = JSON.parse(raw);
		} catch (err) {
			console.error('JSON parse error:', err);
			return fail(400, { error: 'Invalid JSON in formItems' });
		}

		if (
			!parsed.user ||
			typeof parsed.user.email !== 'string' ||
			typeof parsed.user.form_hash !== 'string' ||
			!Array.isArray(parsed.response)
		) {
			return fail(400, { error: 'Invalid payload structure' });
		}

		const supabase = createSupabaseServerClient(event);
		const insertObj = {
			response: parsed.response,
			form_hash: parsed.user.form_hash,
			email: parsed.user.email
		};

		const { data, error: insertError } = await supabase.from('form-responses').insert(insertObj);

		if (insertError) {
			console.error('Supabase insert error:', insertError);
			return fail(500, { error: 'Failed to save form response' });
		}

		return { success: true, data };
	}
};

async function getPostFromDatabase(slug: string, event: Parameters<PageServerLoad>[0]) {
	const supabase = createSupabaseServerClient(event);

	const { data, error } = await supabase
		.from('forms')
		.select('form_data, creator_email, form_hash, formCloseTime, backgroundSettings, form_name')
		.eq('form_hash', slug)
		.single();

	if (error) {
		console.error('Error fetching form:', error);
		return null;
	}

	// If formCloseTime exists and is *before now*, the form is considered closed
	if (data.formCloseTime && new Date(data.formCloseTime) < new Date()) {
		console.warn('Form is closed for submissions');
		return null;
	}

	return data;
}
