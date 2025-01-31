import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { desc, eq, inArray, sql, and } from 'drizzle-orm';
import { z } from 'zod';
import { ex_tag, debit_emails, currency } from '$lib/server/db/schema.js';


const debitEmailSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    from: z.string().email('Invalid from email'),
    to: z.string().email('Invalid to email'),
    currency_id: z.string().uuid('Invalid currency ID').nullable().optional(),
    amount: z.number().positive('Amount must be positive'),
    ex_tag: z.string().uuid('Invalid tag ID').nullable().optional(),
    emailDate: z.string().datetime(),
    createdAt: z.string().datetime(),
    email_id: z.string().min(1, 'Invalid email ID'),
    userId: z.string().uuid()

});

const debitEmailArraySchema = z.array(debitEmailSchema).min(1, 'At least one email is required');

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();

        // Validate the array of emails
        const validated = debitEmailArraySchema.parse(body);

        // Ensure all emails have the same userId
        const uniqueUserIds = [...new Set(validated.map(email => email.userId))];
        if (uniqueUserIds.length !== 1) {
            return json({
                success: false,
                error: 'All emails must belong to the same user'
            }, { status: 400 });
        }

        const userId = uniqueUserIds[0];

        // Verify that the user exists
        const existingUser = await db
            .select({ id: table.user.id })
            .from(table.user)
            .where(eq(table.user.id, userId))
            .limit(1);

        if (!existingUser.length) {
            return json({
                success: false,
                error: 'Invalid user ID',
                details: userId
            }, { status: 400 });
        }

        // Transform and insert data
        const transformedData = validated.map(email => ({
            subject: email.subject,
            body: email.body,
            from: email.from,
            to: email.to,
            amount: email.amount.toString(),
            ex_tag: email.ex_tag || null,
            emailDate: new Date(email.emailDate),
            createdAt: new Date(email.createdAt),
            email_id: email.email_id,
            currency_id: email.currency_id,
            userId: userId
        }));

        const result = await db.insert(table.debit_emails).values(transformedData).returning();

        return json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            }, { status: 400 });
        }

        console.error('Error creating debit emails:', error);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
};


export const GET: RequestHandler = async ({ url }) => {
    try {
        // Get query parameters
        const userId = url.searchParams.get('userId');
        const emailId = url.searchParams.get('email_id');
        const limit = parseInt(url.searchParams.get('limit') ?? '50');
        const offset = parseInt(url.searchParams.get('offset') ?? '0');
        const tagId = url.searchParams.get('tag');
        
        if (!userId) {
            return json({ success: false, error: 'Missing userId parameter' }, { status: 400 });
        }
        
        // Fetch a single email by email_id if provided
        if (emailId) {
            const result = await db
                .select()
                .from(debit_emails)
                .leftJoin(currency, eq(debit_emails.currency_id, currency.id))
                .leftJoin(ex_tag, eq(debit_emails.ex_tag, ex_tag.id))
                .where(eq(debit_emails.email_id, emailId))
                .limit(1);
            
            if (!result.length) {
                return json({ success: false, error: 'Debit email not found' }, { status: 404 });
            }
            
            return json({ success: true, data: result[0] });
        }

        // Apply tag filter if provided
        if (tagId) {
            const results = await db
                .select({
                    id: debit_emails.id,
                    subject: debit_emails.subject,
                    body: debit_emails.body,
                    from: debit_emails.from,
                    to: debit_emails.to,
                    amount: debit_emails.amount,
                    email_id: debit_emails.email_id,
                    emailDate: debit_emails.emailDate,
                    createdAt: debit_emails.createdAt,
                    updatedAt: debit_emails.updatedAt,
                    currency: {
                        id: currency.id,
                        name: currency.name,
                        code: currency.code,
                        symbol: currency.symbol
                    },
                    tag: {
                        id: ex_tag.id,
                        name: ex_tag.name,
                        description: ex_tag.description
                    }
                })
                .from(debit_emails)
                .leftJoin(currency, eq(debit_emails.currency_id, currency.id))
                .leftJoin(ex_tag, eq(debit_emails.ex_tag, ex_tag.id))
                .where(and(eq(debit_emails.userId, userId), eq(debit_emails.ex_tag, tagId)))
                .orderBy(debit_emails.emailDate)
                .limit(limit)
                .offset(offset);

            const totalCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(debit_emails)
                .where(and(eq(debit_emails.userId, userId), eq(debit_emails.ex_tag, tagId)));

            return json({
                success: true,
                data: results,
                pagination: {
                    total: totalCount[0].count,
                    offset,
                    limit,
                    hasMore: offset + results.length < totalCount[0].count
                }
            });
        }
        
        // Execute query with pagination
        const results = await db
            .select({
                id: debit_emails.id,
                subject: debit_emails.subject,
                body: debit_emails.body,
                from: debit_emails.from,
                to: debit_emails.to,
                amount: debit_emails.amount,
                email_id: debit_emails.email_id,
                emailDate: debit_emails.emailDate,
                createdAt: debit_emails.createdAt,
                updatedAt: debit_emails.updatedAt,
                currency: {
                    id: currency.id,
                    name: currency.name,
                    code: currency.code,
                    symbol: currency.symbol
                },
                tag: {
                    id: ex_tag.id,
                    name: ex_tag.name,
                    description: ex_tag.description
                }
            })
            .from(debit_emails)
            .leftJoin(currency, eq(debit_emails.currency_id, currency.id))
            .leftJoin(ex_tag, eq(debit_emails.ex_tag, ex_tag.id))
            .where(eq(debit_emails.userId, userId))
            .orderBy(debit_emails.emailDate)
            .limit(limit)
            .offset(offset);
        
        // Get total count for pagination
        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(debit_emails)
            .where(eq(debit_emails.userId, userId));
        
        // Return the response
        return json({
            success: true,
            data: results,
            pagination: {
                total: totalCount[0].count,
                offset,
                limit,
                hasMore: offset + results.length < totalCount[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching debit emails:', error);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
};



// export const PATCH: RequestHandler = async ({ request }) => {
//     try {
//         const body = await request.json();

//         // Validate the update payload
//         const updateSchema = z.object({
//             id: z.string().min(1, 'Invalid email ID'),
//             tagID: z.string().uuid('Invalid tag ID').optional() // Only validate the tagID
//         });

//         const validated = updateSchema.parse(body);
        


//         // Verify the tag exists if provided
//         if (validated.tagID) {
//             const existingTag = await db
//                 .select({ id: table.ex_tag.id })
//                 .from(table.ex_tag)
//                 .where(eq(table.ex_tag.id, validated.tagID))
//                 .limit(1);

        

//             if (!existingTag.length) {
//                 return json({
//                     success: false,
//                     error: 'Invalid tag ID',
//                     details: validated.tagID
//                 }, { status: 400 });
//             }
//         }

//         // Update the email with the tagID
//         const result = await db
//             .update(table.debit_emails)
//             .set({ ex_tag: validated.tagID }) // Only update the tagID
//             .where(eq(table.debit_emails.id, validated.id))
//             .returning();

//         if (!result.length) {
//             return json({
//                 success: false,
//                 error: 'Debit email not found'
//             }, { status: 404 });
//         }

//         return json({
//             success: true,
//             data: result[0]
//         });

//     } catch (error) {
//         if (error instanceof z.ZodError) {
//             return json({
//                 success: false,
//                 error: 'Validation error',
//                 details: error.errors.map(err => ({
//                     path: err.path.join('.'),
//                     message: err.message
//                 }))
//             }, { status: 400 });
//         }

//         console.error('Error updating debit email:', error);
//         return json({
//             success: false,
//             error: 'Internal server error'
//         }, { status: 500 });
//     }
// };













export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        // Validate the update payload
        const updateSchema = z.object({
            id: z.string().uuid().min(1,'Invalid email ID'),
            updates: z.object({
                subject: z.string().min(1, 'Subject is required').optional(),
                body: z.string().min(1, 'Body is required').optional(),
                from: z.string().email('Invalid from email').optional(),
                to: z.string().email('Invalid to email').optional(),
                amount: z.number().positive('Amount must be positive').optional(),
                ex_tag: z.string().uuid('Invalid tag ID').optional(),
                emailDate: z.string().datetime().optional()
            })
        });

        const validated = updateSchema.parse(body);

        // If ex_tag is being updated, verify it exists
        if (validated.updates.ex_tag) {
            const existingTag = await db
                .select({ id: table.ex_tag.id })
                .from(table.ex_tag)
                .where(eq(table.ex_tag.id, validated.updates.ex_tag))
                .limit(1);

            if (!existingTag.length) {
                return json({
                    success: false,
                    error: 'Invalid tag ID',
                    details: [validated.updates.ex_tag]
                }, { status: 400 });
            }
        }

        // Transform the data if needed
        const updateData = {
            ...validated.updates,
            amount: validated.updates.amount?.toString(),
            emailDate: validated.updates.emailDate ? new Date(validated.updates.emailDate) : undefined
        };


        // Update the email
        const result = await db
            .update(table.debit_emails)
            .set(updateData)
            .where(eq(table.debit_emails.id, validated.id))
            .returning();

        if (!result.length) {
            return json({
                success: false,
                error: 'Debit email not found'
            }, { status: 404 });
        }

        return json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            }, { status: 400 });
        }

        console.error('Error updating debit email:', error);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
};

