import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { debit_emails, currency, ex_tag } from '$lib/server/db/schema.js';
import { sql, eq, and, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const userId = url.searchParams.get('userId');
        if (!userId) {
            return json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }
        const tagSpending = await db.execute(sql`
            WITH current_period AS (
                SELECT 
                    et.id as tag_id,
                    et.name as tag_name,
                    c.code as currency_code,
                    SUM(de.amount) as total_amount
                FROM debit_emails de
                LEFT JOIN ex_tag et ON de.ex_tag = et.id
                LEFT JOIN currency c ON de.currency_id = c.id
                WHERE de.user_id = ${userId}
                  AND de.email_date >= NOW() - INTERVAL '30 days'
                GROUP BY et.id, et.name, c.code
            ),
            previous_period AS (
                SELECT 
                    et.id as tag_id,
                    SUM(de.amount) as prev_amount
                FROM debit_emails de
                LEFT JOIN ex_tag et ON de.ex_tag = et.id
                WHERE de.user_id = ${userId}
                  AND de.email_date >= NOW() - INTERVAL '60 days'
                  AND de.email_date < NOW() - INTERVAL '30 days'
                GROUP BY et.id
            )
            SELECT 
                cp.tag_id,
                cp.tag_name,
                cp.currency_code,
                cp.total_amount,
                CASE 
                    WHEN pp.prev_amount = 0 OR pp.prev_amount IS NULL THEN 100
                    ELSE ((cp.total_amount - pp.prev_amount) / pp.prev_amount * 100)
                END as change_percent
            FROM current_period cp
            LEFT JOIN previous_period pp ON cp.tag_id = pp.tag_id
            ORDER BY cp.total_amount DESC
        `);

        const monthlySpending = await db
            .select({
                month: sql`DATE_TRUNC('month', ${debit_emails.emailDate})`,
                totalAmount: sql<string>`SUM(${debit_emails.amount})`,
                currencyCode: currency.code
            })
            .from(debit_emails)
            .leftJoin(currency, eq(debit_emails.currency_id, currency.id))
            .groupBy(sql`DATE_TRUNC('month', ${debit_emails.emailDate})`, currency.code)
            .orderBy(desc(sql`DATE_TRUNC('month', ${debit_emails.emailDate})`));

        const recentTopCategories = await db
            .select({
                tagId: ex_tag.id,
                tagName: ex_tag.name,
                totalAmount: sql<string>`SUM(${debit_emails.amount})`,
                currencyCode: currency.code
            })
            .from(debit_emails)
            .leftJoin(ex_tag, eq(debit_emails.ex_tag, ex_tag.id))
            .leftJoin(currency, eq(debit_emails.currency_id, currency.id))
            .where(
                and(
                    sql`${debit_emails.emailDate} >= NOW() - INTERVAL '30 days'`,
                    sql`${debit_emails.ex_tag} IS NOT NULL`
                )
            )
            .groupBy(ex_tag.id, ex_tag.name, currency.code)
            .orderBy(desc(sql<number>`SUM(${debit_emails.amount})`))
            .limit(5);

        return json({
            success: true,
            data: {
                tagSpending,
                monthlySpending,
                recentTopCategories
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
};