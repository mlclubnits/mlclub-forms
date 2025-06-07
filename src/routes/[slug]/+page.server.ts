import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase';

export const load: PageServerLoad = async (event) => {
    const slug = event.params.slug;
    if (!slug) {
        throw error(404, 'Not found');
    }
    const post = await getPostFromDatabase(slug, event);

    if (post) {
        return post;
    }

    error(404, 'Not found');
};

async function getPostFromDatabase(slug: string, event: Parameters<PageServerLoad>[0]) {
    const supabase = createSupabaseServerClient(event);
    const { data, error } = await supabase
        .from('forms')
        .select('form_data, creator_email, form_hash, formCloseTime')
        .eq('form_hash', slug)
        .single();

    if (error) {
        console.error('Error fetching form:', error);
        return null;
    }

    if (data.formCloseTime && new Date(data.formCloseTime) > new Date()) {
        return data;
    } else {
        return null;
    }
}
