// src/routes/[slug]/+page.server.ts
import { error as svelteError, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        throw svelteError(401, 'Unauthorized');
    }
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
            formCloseTime: post.formCloseTime,
            backgroundSettings: post.backgroundSettings
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
            backgroundSettings: unknown[];
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
            formCloseTime: parsed.user.closeTime,
            backgroundSettings: parsed.backgroundSettings
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
    const user = event.locals.user;

    if (!user) {
        console.error('User not logged in');
        return null;
    }

    // Fetch form data
    const { data: formData, error: fetchError } = await supabase
        .from('forms')
        .select('form_data, creator_email, form_name, form_hash, formCloseTime, backgroundSettings')
        .eq('form_hash', slug)
        .single();

    if (fetchError) {
        console.error('Error fetching form:', fetchError.message);
        return null;
    }
    if (!formData) {
        return null;
    }

    // Check access: either creator or shared
    const isCreator = formData.creator_email === user.email;

    let isShared = false;

    if (!isCreator) {
        const { data: sharedRecords, error: shareError } = await supabase
            .from('forms-access-relation')
            .select('shared_email')
            .eq('form_hash', slug)
            .eq('shared_email', user.email);

        if (shareError) {
            console.error('Error checking shared access:', shareError.message);
            return null;
        }

        isShared = sharedRecords && sharedRecords.length > 0;
    }

    if (!isCreator && !isShared) {
        console.warn('Access denied: not creator or shared user');
        return null;
    }

    // Optionally: fetch all shared emails (for UI display or edit)
    const { data: sharedRelations, error: relationError } = await supabase
        .from('forms-access-relation')
        .select('shared_email')
        .eq('form_hash', slug);

    if (relationError) console.log("Some error occured: ", relationError);

    const shared_with = sharedRelations?.map((item) => item.shared_email) || [];

    // Return data
    return {
        ...formData,
        shared_with
    };
}


