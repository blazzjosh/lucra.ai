import type { Handle } from '@sveltejs/kit';
import { session as sessionTable, user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get("session_id");
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const sessionData = await db
		.select({ userId: user.id, email: user.email, name: user.name, picture: user.picture })
		.from(sessionTable)
		.leftJoin(user, eq(user.id, sessionTable.userId))
		.where(eq(sessionTable.id, sessionId))
		.limit(1);

	if (sessionData.length > 0) {
		event.locals.user = sessionData[0];
	}


	return resolve(event);
};

export const handle: Handle = handleAuth;
