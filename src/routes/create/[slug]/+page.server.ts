// src/routes/[slug]/+page.server.ts
import { error as svelteError, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const load: PageServerLoad = async (event) => {
    const slug = event.params.slug;
    if (!slug) {
        throw svelteError(404, 'Not found');
    }

    const post = await getPostFromDatabase(slug, event);
    if (post) {
        // Return named fields so +page.svelte can destructure `data`
        return {
            form_data: post.form_data,
            creator_email: post.creator_email,
            form_name: post.form_name,
            form_hash: post.form_hash,
            formCloseTime: post.formCloseTime
        };
    }

    throw svelteError(404, 'Not found');
};

export const actions: Actions = {
    default: async (event: RequestEvent) => {
        const formData = await event.request.formData();
        const raw = formData.get('formItems');
        if (!raw || typeof raw !== 'string') {
            return fail(400, { error: 'Missing formItems JSON' });
        }

        interface ParsedFormItems {
            user: {
                email: string;
                form_hash: string;
                form_name: string;
                closeTime: string;
            };
            formItems: unknown[];
        }
        let parsed: ParsedFormItems;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return fail(400, { error: 'Invalid JSON in formItems' });
        }

        // Validate expected shape
        if (
            !parsed.user ||
            typeof parsed.user.email !== 'string' ||
            typeof parsed.user.form_hash !== 'string' ||
            typeof parsed.user.closeTime !== 'string' ||
            !Array.isArray(parsed.formItems)
        ) {
            return fail(400, { error: 'Invalid payload structure' });
        }

        const supabase = createSupabaseServerClient(event);
        const updateObj = {
            form_data: parsed.formItems,
            form_name: parsed.user.form_name, // assuming you want to save this too
            formCloseTime: parsed.user.closeTime
        };

        const { data: updatedRow, error: updateError } = await supabase
            .from('forms')
            .update(updateObj)
            .eq('form_hash', parsed.user.form_hash)
            .select() // return updated row
            .single();

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return fail(500, { error: 'Failed to save form' });
        }

        console.log('Update succeeded, updated row:', updatedRow);
        return { success: true };
    }
};

async function getPostFromDatabase(slug: string, event: RequestEvent) {
    const supabase = createSupabaseServerClient(event);
    const { data, error: fetchError } = await supabase
        .from('forms')
        .select('form_data, creator_email, form_name, form_hash, formCloseTime')
        .eq('form_hash', slug)
        .single();

    if (fetchError) {
        console.error('Error fetching form:', fetchError);
        return null;
    }
    if (!data) {
        return null;
    }
    console.log(data)
    return data;
}
