import { json, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { oAuth2Client } from '$lib/server/oauth-config.js';
import { createSession } from '$lib/server/auth.js';


export const load: PageServerLoad = async ({ fetch, url, cookies }) => {
  try {
    const code = url.searchParams.get('code');
    if (!code) throw new Error('No code provided');

    const { tokens } = await oAuth2Client.getToken(code);

    const { session } = await createSession({
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      expiry_date: tokens.expiry_date || Date.now() + 3600000
    });

    cookies.set('session_id', session.id, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    if (tokens.access_token) {
      cookies.set('gmail_access_token', tokens.access_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 // 1 hour
      });
    }

    if (tokens.refresh_token) {
      cookies.set('gmail_refresh_token', tokens.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return {
      success: true,
      redirect: '/[authenticated]/dashboard'
    }


  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
};
