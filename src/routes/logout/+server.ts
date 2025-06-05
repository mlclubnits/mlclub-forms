// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';

export async function GET({ locals, cookies }) {
    await locals.supabase.auth.signOut();
    // Clear the session and user data
    locals.session = null;
    locals.user = null;
    // Optionally, clear cookies if you're using them for session management
    cookies.delete('user_data', { path: '/' });
    throw redirect(303, '/auth/login');
}
