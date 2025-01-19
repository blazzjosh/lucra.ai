import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema.js';
import { eq, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import { ex_tag } from '$lib/server/db/schema.js';


const tagSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    active: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    created_at: z.date().optional(),
    updated_at: z.date().optional()
});

const inputSchema = z.union([
    tagSchema,
    z.array(tagSchema)
]);

export const PATCH: RequestHandler = async ({ request }) => {
    const body = await request.json();

    return json({
        success: true,
        data: 'PATCH'
    });
}


export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const userId = url.searchParams.get('userId');

        const body = await request.json();

        const validated = inputSchema.parse(body);

        const tagsToInsert = (Array.isArray(validated) ? validated : [validated])
            .map(tag => {
                if (!tag.isDefault && !userId) {
                    throw new Error('User ID is required for non-default tags');
                }
                return {
                    ...tag,
                    userId: tag.isDefault ? null : userId
                };
            })

        const tags = await db.insert(table.ex_tag)
            .values(tagsToInsert)
            .onConflictDoNothing()
            .returning();

        return json({
            success: true,
            data: tags,
            count: tags.length
        });


    } catch (err) {
        if (err instanceof z.ZodError) {
            return json({
                success: false,
                error: 'Validation error',
                details: err.errors
            }, { status: 400 });
        }
        console.error('Error creating tags:', err);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}



export const GET: RequestHandler = async ({ url }) => {
    try {
        // Check if we have an ID in the params for single tag lookup
        const id = url.searchParams.get('id');

        if (id) {
            // Single tag lookup
            const tag = await db
                .select()
                .from(table.ex_tag)
                .where(eq(table.ex_tag.id, id))
                .limit(1);

            if (!tag.length) {
                return json({
                    success: false,
                    error: 'Tag not found'
                }, { status: 404 });
            }

            return json({
                success: true,
                data: tag[0]
            });
        }

        // If no ID, handle as a list request
        const searchQuery = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') ?? '50');
        const offset = parseInt(url.searchParams.get('offset') ?? '0');

        // Build query
        let query: any = db.select().from(table.ex_tag);

        if (searchQuery) {
            query = query.where(like(ex_tag.name, `%${searchQuery}%`));
        }

        // Add pagination
        query = query
            .limit(limit)
            .offset(offset)
            .orderBy(ex_tag.name);

        const tags = await query;

        // Get total count
        const countQuery = await db
            .select({ count: sql<number>`count(*)` })
            .from(ex_tag);
        const totalCount = Number(countQuery[0].count);

        return json({
            success: true,
            data: tags,
            pagination: {
                total: totalCount,
                offset,
                limit,
                hasMore: offset + tags.length < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching tags:', error);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
};