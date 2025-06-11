// src/routes/dashboard/+page.server.ts
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase.js';

export const load: PageServerLoad = async (event) => {
  // If not logged in, send them to /login (or wherever)
  if (!event.locals.session || !event.locals.user) {
    throw redirect(303, '/login');
  }

  const supabase = createSupabaseServerClient(event);
  const { data, error: fetchError } = await supabase
    .from('forms')
    .select('id, form_name, creator_email, form_hash, created_at')
    .eq('creator_email', event.locals.user.email);

  if (fetchError) {
    console.error('Error fetching dashboard forms:', fetchError);
    // You could throw an error(500) or just return empty.
    throw error(500, 'Could not load your forms');
  }

  return {
    forms: data ?? []
  };
};
