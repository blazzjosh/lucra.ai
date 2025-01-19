import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { PUBLIC_REDIRECT_URI } from '$env/static/public';

export const GET: RequestHandler = async () => {
    return json({
        redirect_uri: PUBLIC_REDIRECT_URI,
        configured_uris_match: PUBLIC_REDIRECT_URI === 'http://localhost:5173/auth/gmail'
    });
};