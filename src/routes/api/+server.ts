// write get request code for server.ts
import type { RequestHandler } from '@sveltejs/kit';
// not for supabase, just for testing
export const GET: RequestHandler = async () => {
    const datetime = new Date().toISOString();
    return new Response(
        JSON.stringify({
            message: `Success!`,
            datetime
        })
    );
};