// example in +page.server.ts load function

import type { User } from '$lib/types';

export const load = async ({ cookies }) => {
	const userCookie = cookies.get('user_data');
	let userdata: User | null = null;

	if (userCookie) {
		try {
			userdata = JSON.parse(userCookie) as User;
		} catch {
			// handle invalid JSON, maybe clear cookie or fallback
			userdata = null;
		}
	}
	return { userdata };
};
