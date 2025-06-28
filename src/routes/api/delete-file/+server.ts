import { v2 as cloudinary } from 'cloudinary';
import type { RequestHandler } from '@sveltejs/kit';
import env from '$env/static/private';

cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET
});

export const POST: RequestHandler = async ({ request }) => {
	const { publicId } = await request.json();
	await cloudinary.uploader.destroy(publicId);
	return new Response(JSON.stringify({ success: true }), { status: 200 });
};
