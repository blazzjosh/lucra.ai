import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { currency } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const currencySchema = z.object({
    id: z.string().uuid().optional(),
    code: z.string().min(1, 'Code is required').max(10),
    name: z.string().min(1, 'Name is required'),
    symbol: z.string().min(1, 'Symbol is required'),
    decimal_places: z.number().min(0).max(10).default(2),
    active: z.boolean().optional()
});

const inputSchema = z.union([
    currencySchema,
    z.array(currencySchema)
]);

// CREATE: Add new currencies
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const validated = inputSchema.parse(body);
        const currenciesToInsert = Array.isArray(validated) ? validated : [validated];

        const insertedCurrencies = await db.insert(currency).values(currenciesToInsert).onConflictDoNothing().returning();

        return json({
            success: true,
            data: insertedCurrencies,
            count: insertedCurrencies.length
        });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return json({
                success: false,
                error: 'Validation error',
                details: err.errors
            }, { status: 400 });
        }
        console.error('Error creating currencies:', err);
        return json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
};

// READ: Get currencies
export const GET: RequestHandler = async ({ url }) => {
    try {
        const id = url.searchParams.get('id');
        const searchQuery = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') ?? '50');
        const offset = parseInt(url.searchParams.get('offset') ?? '0');

        if (id) {
            const currencyData = await db.select().from(currency).where(eq(currency.id, id)).limit(1);
            if (!currencyData.length) {
                return json({ success: false, error: 'Currency not found' }, { status: 404 });
            }
            return json({ success: true, data: currencyData[0] });
        }

        let query: any = db.select().from(currency);
        if (searchQuery) {
            query = query.where(sql`${currency.code} ILIKE ${'%' + searchQuery + '%'}`);
        }

        query = query.limit(limit).offset(offset).orderBy(currency.name);

        const currencies = await query;

        const countQuery = await db.select({ count: sql<number>`count(*)` }).from(currency);
        const totalCount = Number(countQuery[0].count);

        return json({
            success: true,
            data: currencies,
            pagination: {
                total: totalCount,
                offset,
                limit,
                hasMore: offset + currencies.length < totalCount
            }
        });

    } catch (err) {
        console.error('Error fetching currencies:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
};

// UPDATE: Modify existing currency
export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { id, ...updates } = currencySchema.partial().parse(body);

        if (!id) {
            return json({ success: false, error: 'ID is required for updates' }, { status: 400 });
        }

        const updatedCurrency = await db.update(currency).set(updates).where(eq(currency.id, id)).returning();

        if (!updatedCurrency.length) {
            return json({ success: false, error: 'Currency not found or not updated' }, { status: 404 });
        }

        return json({ success: true, data: updatedCurrency[0] });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return json({
                success: false,
                error: 'Validation error',
                details: err.errors
            }, { status: 400 });
        }
        console.error('Error updating currency:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
};

// DELETE: Remove currency
export const DELETE: RequestHandler = async ({ url }) => {
    try {
        const id = url.searchParams.get('id');
        if (!id) {
            return json({ success: false, error: 'ID is required for deletion' }, { status: 400 });
        }

        const deletedCurrency = await db.delete(currency).where(eq(currency.id, id)).returning();

        if (!deletedCurrency.length) {
            return json({ success: false, error: 'Currency not found or already deleted' }, { status: 404 });
        }

        return json({ success: true, data: deletedCurrency[0] });

    } catch (err) {
        console.error('Error deleting currency:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
};
