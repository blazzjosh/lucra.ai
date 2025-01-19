// src/routes/api/auth/gmail/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types.js';
import { oAuth2Client, GMAIL_SCOPES, validateOAuthConfig } from '$lib/server/oauth-config.js';


// Generate auth URL
export const GET: RequestHandler = async () => {
    validateOAuthConfig();
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GMAIL_SCOPES,
        prompt: 'consent'
    });

    return json({ url: authUrl });
};

