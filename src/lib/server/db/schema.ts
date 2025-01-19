import { pgTable, text, integer, timestamp, numeric, uuid, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	picture: text('picture')
  });
  
  export const gmail_config = pgTable('gmail_config', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
	  .notNull()
	  .references(() => user.id),
	accessToken: text('access_token').notNull(),
	refreshToken: text('refresh_token'),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
  });
  
  export const session = pgTable('session', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
	  .notNull()
	  .references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
  });

export const ex_tag = pgTable('ex_tag', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	description: text('description').notNull(),
	active: boolean('active').notNull().default(true),
	created_at: timestamp('created_at').notNull().defaultNow(),
	updated_at: timestamp('updated_at'),
	userId: uuid('user_id')
	  .references(() => user.id),
	isDefault: boolean('is_default').notNull().default(false),	
});

export const currency = pgTable('currency', {
	id: uuid('id').primaryKey().defaultRandom(),
	code: text('code').notNull().unique(),  // e.g., USD, EUR, GBP
	name: text('name').notNull(),           // e.g., US Dollar, Euro, British Pound
	symbol: text('symbol').notNull(),       // e.g., $, €, £
	decimal_places: integer('decimal_places').notNull().default(2),
	active: boolean('active').notNull().default(true),
	created_at: timestamp('created_at').notNull().defaultNow(),
	updated_at: timestamp('updated_at')
});

export const debit_emails = pgTable('debit_emails', {
	id: uuid('id').primaryKey().defaultRandom(),
	email_id: text('email_id').notNull(),
	subject: text('subject').notNull(),
	body: text('body').notNull(),
	from: text('from').notNull(),
	to: text('to').notNull(),
	amount: numeric('amount').notNull(),
	currency_id: uuid('currency_id').references(() => currency.id),
	ex_tag: uuid('ex_tag').references(() => ex_tag.id),
	emailDate: timestamp('email_date').notNull(),
	createdAt: timestamp('created_at').notNull(),
	userId: uuid('user_id')
	  .notNull()
	  .references(() => user.id),
	updatedAt: timestamp('updated_at')
});


export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type DebitEmail = typeof debit_emails.$inferSelect;
export type ExTag = typeof ex_tag.$inferSelect;
export type Currency = typeof currency.$inferSelect;
