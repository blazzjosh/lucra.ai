import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { debit_emails } from '$lib/server/db/schema.js';
import { and, eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email_ids, userId } = await request.json();

        // Validate userId
        if (!userId) {
            return json({ success: false, error: 'Missing userId parameter' }, { status: 400 });
        }

        // Validate email_ids
        if (!email_ids || !Array.isArray(email_ids) || email_ids.length === 0) {
            return json({ success: false, error: 'Missing or invalid email_ids parameter' }, { status: 400 });
        }

        // Query existing emails
        const existing = await db
            .select({ email_id: debit_emails.email_id })
            .from(debit_emails)
            .where(
                and(
                    inArray(debit_emails.email_id, email_ids),
                    eq(debit_emails.userId, userId)
                )
            );

        // Debug query result
        // console.log('Existing emails:', existing);

        return json({
            success: true,
            data: existing.map(e => e.email_id)
        });
    } catch (error) {
        console.error('Error checking emails:', error);
        return json({ success: false, error: 'Failed to check emails' }, { status: 500 });
    }
};
