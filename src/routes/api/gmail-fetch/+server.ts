// src/routes/api/gmail/fetch/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { google } from 'googleapis';
import { oAuth2Client } from '$lib/server/oauth-config.js';
import { getBankFormat, parseEmailContent } from '$lib/bank-parsers/index.js';

// Helper function to extract HTML content
function extractHtmlBody(payload: any): string {
    if (!payload) return '';

    // Try to find HTML part first
    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/html' && part.body?.data) {
                return Buffer.from(part.body.data, 'base64').toString();
            }
            // Recursively check nested parts
            if (part.parts) {
                const nestedHtml = extractHtmlBody(part);
                if (nestedHtml) return nestedHtml;
            }
        }
    }

    // Fallback to plain text if no HTML found
    if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString();
    }

    return '';
}

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        const accessToken = cookies.get('gmail_access_token');
        if (!accessToken) {
            return json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        oAuth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        // Query for debit alerts from multiple banks
        const query = '(subject:"Debit Alert" OR subject:"Transaction Alert" OR subject:"Debit Transaction") after:2024/12/31';
        // console.log('Gmail Query:', query);

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
          
            
        });

        if (!response.data.messages) {
            return json({
                success: true,
                data: [],
                message: 'No new debit alerts found'
            });
        }

        const emails = await Promise.all(
            response.data.messages.map(async (message) => {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full'
                });

                const headers = email.data.payload?.headers;
                const subject = headers?.find(h => h.name === 'Subject')?.value || '';
                const from = headers?.find(h => h.name === 'From')?.value || '';
                const to = headers?.find(h => h.name === 'To')?.value || '';
                const date = headers?.find(h => h.name === 'Date')?.value || '';

                // Get HTML content
                const htmlBody = extractHtmlBody(email.data.payload);
                
                // Determine bank format and parse accordingly
                const bankFormat = getBankFormat(from, subject);
                if (!bankFormat) {
                    console.log('Unrecognized bank format:', { from, subject });
                    return null;
                }

                const result = await parseEmailContent(htmlBody, bankFormat);
                if (!result) {
                    console.log('Failed to parse email content:', { from, subject });
                    return null;
                }
                const { details, amount, bankName, currencyId, currencyCode } = result;

                return {
                    id: message.id,
                    subject,
                    from: from.match(/<(.+)>/)?.[1] || from,
                    to: to.match(/<(.+)>/)?.[1] || to,
                    amount,
                    body: htmlBody,
                    emailDate: new Date(date).toISOString(),
                    createdAt: new Date().toISOString(),
                    bankName,
                    transactionDetails: details,
                    currency_id: currencyId,
                    currency_code: currencyCode
                };
            })
        );


        // Filter valid debit alerts
        const validEmails = emails.filter((email): email is NonNullable<typeof email> => 
            email !== null && 
            email.amount !== null &&
            email.subject.toLowerCase().includes('debit') &&
            new Date(email.emailDate).getFullYear() === 2025


        );

        return json({
            success: true,
            data: validEmails,
            total: validEmails.length
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch emails'
        }, { status: 500 });
    }
};