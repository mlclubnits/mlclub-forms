import { v2 as cloudinary } from 'cloudinary';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_CLOUDINARY_API_KEY, PUBLIC_CLOUDINARY_API_SECRET, PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

cloudinary.config({
    cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: PUBLIC_CLOUDINARY_API_KEY,
    api_secret: PUBLIC_CLOUDINARY_API_SECRET
});

export const POST: RequestHandler = async ({ request }) => {
    const { publicId } = await request.json();
    await cloudinary.uploader.destroy(publicId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};
