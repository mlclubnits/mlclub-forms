// src/routes/formbuilder/+page.server.ts
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase';

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		// 1️⃣ Extract the hidden formItems field from the POST request
		const formData = await event.request.formData();
		const raw = formData.get('formItems');
        
		if (!raw || typeof raw !== 'string') {
            return fail(400, { error: 'Missing formItems JSON' });
		}
        
		// 2️⃣ Parse JSON
		let parsed;
		try {
            parsed = JSON.parse(raw);
		} catch (e) {
            return fail(400, { error: 'Invalid JSON in formItems' });
		}
        
		// 3️⃣ Insert into Supabase
        console.log(parsed);
		const supabase = createSupabaseServerClient(event);
		const { data, error } = await supabase
			.from('forms') // ← your Supabase table name
			.insert([{ form_data: parsed.formItems, creator_email: parsed.user.email, form_hash: parsed.user.random }]);

		if (error) {
			console.error('Supabase insert error:', error);
			return fail(500, { error: 'Failed to save form' });
		}

		// 4️⃣ Return success (page will reload by default)
		return { success: true };
	}
};
