import { pgTable, uuid, timestamp, varchar, text, index } from 'drizzle-orm/pg-core';
import { postsTable } from './Posts.js';
import { usersTable } from './Users.js';


export const postViewsTable = pgTable("post_views", {

    view_id: uuid('view_id').primaryKey().defaultRandom(),
    post_id: uuid('post_id')
        .references(() => postsTable.post_id, { onDelete: 'cascade' })
        .notNull(),
    user_id: uuid('user_id')
        .references(() => usersTable.user_id, { onDelete: 'cascade' })
        .notNull(),
    viewed_at: timestamp('viewed_at').defaultNow(),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
}, (table) => ({
    postUserIdx: index('post_user_view_idx').on(table.post_id, table.user_id, table.viewed_at),

}));