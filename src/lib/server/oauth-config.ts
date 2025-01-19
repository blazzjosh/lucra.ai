import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';
import { PUBLIC_REDIRECT_URI } from '$env/static/public';


export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;


export const oAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    PUBLIC_REDIRECT_URI
);

export const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
];


export function validateOAuthConfig() {
    if (!GOOGLE_CLIENT_ID) throw new Error('Missing GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_SECRET) throw new Error('Missing GOOGLE_CLIENT_SECRET');
}