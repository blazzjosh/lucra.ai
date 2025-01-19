import type { PageServerLoad } from './$types.js';
import type { DebitEmail } from '$lib/server/db/schema.js';


export const load: PageServerLoad = async ({ fetch, locals }) => {

    const gmails_res = await fetch('/api/gmail-fetch');
    const gmails = await gmails_res.json();



    if (!gmails.success) {
        return {
            emails: [],
            ex_tags: [],
            analytics: []
        }
    }


    if (gmails.success && gmails.data.length > 0) {
        const existingRes = await fetch('/api/debit-emails/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: locals.user.userId,
                email_ids: gmails.data.map((email: DebitEmail) => email.id)
            })
        });

        const existingEmails = await existingRes.json();
        const existingIds = new Set(existingEmails.data);

        const newEmails: DebitEmail[] = gmails.data
            .filter((email: DebitEmail) => !existingIds.has(email.id))
            .map((email: DebitEmail) => ({
                subject: email.subject,
                body: email.body,
                from: email.from,
                to: email.to,
                amount: email.amount,
                emailDate: email.emailDate,
                createdAt: new Date(),
                email_id: email.id,
                currency_id: email.currency_id,
                ex_tag: email.ex_tag,
                userId: locals.user.userId
            }));



        if (newEmails.length > 0) {
            await fetch('/api/debit-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmails)
            });
        }

        // }

        const analyticsRes = await fetch('/api/analytics?userId=' + locals.user.userId);
        const analytics = await analyticsRes.json();

        const [emails_res, tags_res] = await Promise.all([
            fetch('/api/debit-emails?userId=' + locals.user.userId),
            fetch('/api/tags?userId=' + locals.user.userId)
        ]);

        const [emails, ex_tags] = await Promise.all([
            emails_res.json(),
            tags_res.json()
        ]);

        return {
            emails: emails.data,
            ex_tags: ex_tags.data,
            analytics: analytics.data
        }
    };
}


export const actions = {
    createTag: async ({ request, fetch, locals }) => {
        const formData = await request.formData();
        const tagName = formData.get('tag_name');
        const tagDescription = formData.get('tag_description');
        const res = await fetch('/api/tags?userId=' + locals.user.userId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ name: tagName, description: tagDescription }])
        });

        if (res.ok) {
            return {
                success: true
            }
        } else {
            return {
                success: false,
                message: 'Failed to create tag'
            }
        }
    }
}