import { google } from 'googleapis';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

// Email parsing schema
const emailSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    from: z.string().email('Invalid from email'),
    to: z.string().email('Invalid to email'),
    amount: z.number().positive('Amount must be positive'),
    emailDate: z.string().datetime(),
    createdAt: z.string().datetime()
});

// Helper function to extract amount from email body
function extractAmount(body: string): number | null {
    // This regex looks for currency amounts
    const amountRegex = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
    const match = body.match(amountRegex);
    if (match) {
        // Remove commas and convert to number
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
}

// Helper function to parse email body
function parseEmailBody(rawBody: string): string {
    // Remove HTML tags if present
    const cleanBody = rawBody.replace(/<[^>]*>/g, '');
    // Remove extra whitespace
    return cleanBody.trim();
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { senderEmail, accessToken } = await request.json();

        // Initialize Gmail API client
        const auth = new OAuth2Client();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        // Build query to fetch unread emails from specific sender
        const query = `from:${senderEmail} is:unread`;

        // Fetch emails
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 50
        });

        if (!response.data.messages) {
            return json({
                success: true,
                data: [],
                message: 'No new emails found'
            });
        }

        // Fetch and parse each email
        const parsedEmails = await Promise.all(
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

                // Extract body
                let body = '';
                if (email.data.payload?.parts) {
                    // Handle multipart message
                    const textPart = email.data.payload.parts.find(
                        part => part.mimeType === 'text/plain'
                    );
                    if (textPart?.body?.data) {
                        body = Buffer.from(textPart.body.data, 'base64').toString();
                    }
                } else if (email.data.payload?.body?.data) {
                    // Handle single part message
                    body = Buffer.from(email.data.payload.body.data, 'base64').toString();
                }

                body = parseEmailBody(body);
                const amount = extractAmount(body);

                try {
                    // Create email object and validate
                    const emailData = emailSchema.parse({
                        subject,
                        body,
                        from: from.match(/<(.+)>/)?.[1] || from,
                        to: to.match(/<(.+)>/)?.[1] || to,
                        amount: amount || 0, // You might want to handle this differently
                        emailDate: new Date(date).toISOString(),
                        createdAt: new Date().toISOString()
                    });

                    // Mark email as read
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: message.id!,
                        requestBody: {
                            removeLabelIds: ['UNREAD']
                        }
                    });

                    return emailData;
                } catch (error) {
                    console.error(`Error parsing email ${message.id}:`, error);
                    return null;
                }
            })
        );

        // Filter out any emails that failed to parse
        const validEmails = parsedEmails.filter((email): email is z.infer<typeof emailSchema> => 
            email !== null
        );

        return json({
            success: true,
            data: validEmails,
            count: validEmails.length
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        return json({
            success: false,
            error: 'Failed to fetch emails',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};