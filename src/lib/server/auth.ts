// lib/server/auth.ts
import { OAuth2Client } from 'google-auth-library';
import { env } from '$env/dynamic/private';
import { PUBLIC_REDIRECT_URI } from '$env/static/public';
import { google } from 'googleapis';
import { db } from '$lib/server/db/index.js';
import { user, session, gmail_config  } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';


export const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
];

export const oAuth2Client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    PUBLIC_REDIRECT_URI
);


export async function createSession(tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date: number;
}) {
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    // Initialize Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Try to find existing user
    let existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, profile.email!))
        .limit(1);

    if (!existingUser.length) {
        // Create new user
        const [newUser] = await db
            .insert(user)
            .values({
                email: profile.email!,
                name: profile.name!,
                picture: profile.picture
            })
            .returning();

        existingUser = [newUser];

        // Create Gmail config
        await db.insert(gmail_config).values({
            userId: newUser.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(tokens.expiry_date)
        });
    } else {
        // Update existing user
        const [updatedUser] = await db
            .update(user)
            .set({
                name: profile.name!,
                picture: profile.picture
            })
            .where(eq(user.id, existingUser[0].id))
            .returning();

        existingUser = [updatedUser];

        // Update Gmail config
        await db.update(gmail_config).set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(tokens.expiry_date)
        }).where(eq(gmail_config.userId, updatedUser.id));
    }

    const _session = await db
        .insert(session)
        .values({
            userId: existingUser[0].id,
            expiresAt: new Date(tokens.expiry_date)
        })
        .returning();

    return { session: _session[0], user: existingUser[0] };
}

export async function getGmailClient(userId: string) {
    const userRecord = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .leftJoin(gmail_config, eq(user.id, gmail_config.userId))
        .limit(1);

    if (!userRecord.length || !userRecord[0].gmail_config) {
        throw new Error('User not connected to Gmail');
    }

    const auth = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        PUBLIC_REDIRECT_URI
    );

    auth.setCredentials({
        access_token: userRecord[0].gmail_config.accessToken,
        refresh_token: userRecord[0].gmail_config.refreshToken,
        expiry_date: userRecord[0].gmail_config.expiresAt.getTime()
    });

    return google.gmail({ version: 'v1', auth });
}



























// routes/auth/callback/+server.ts
// export const GET: RequestHandler = async ({ url, cookies }) => {
//     const code = url.searchParams.get('code');
//     if (!code) throw new Error('No code provided');

//     const { tokens } = await oAuth2Client.getToken(code);
//     const { session, user } = await createSession(tokens);

//     cookies.set('session_id', session.id, {
//         path: '/',
//         httpOnly: true,
//         secure: true,
//         sameSite: 'lax',
//         maxAge: 60 * 60 * 24 * 30 // 30 days
//     });

//     return json({ success: true, redirect: '/dashboard' });
// };

// Example usage in a route that needs email access
// export async function load({ locals }) {
//     if (!locals.user) throw redirect(302, '/login');
    
//     const gmail = await getGmailClient(locals.user.id);
//     const messages = await gmail.users.messages.list({
//         userId: 'me',
//         maxResults: 10
//     });
    
//     return { messages: messages.data };
// }




// routes/auth/callback/+server.ts


