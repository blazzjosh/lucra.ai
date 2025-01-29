import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types.js';
import { db } from '$lib/server/db/index.js';
import {session as sessionTable} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';



export const DELETE: RequestHandler = async ({cookies, locals}) => {
   try {
    // console.log('Logging out server');
    const sessionId = cookies.get('session_id');
    if (!sessionId) {
        return json({error: 'No session ID found'}, {status: 401});
    }

    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));

    cookies.delete('session_id', {path: '/'});
    cookies.delete('gmail_access_token', {path: '/'});
    cookies.delete('gmail_refresh_token', {path: '/'});

    return json({message: 'Logged out successfully'});
   } catch (error) {
    console.error(error);
    return json({error: 'Internal server error'}, {status: 500});
   }
};

