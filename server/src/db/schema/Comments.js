import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";
import { postsTable } from "./Posts.js";

export const commentsTable = pgTable("comments", {

    comment_id: uuid("comment_id").defaultRandom().primaryKey(),
    post_id: uuid("post_id")
        .notNull()
        .references(() => postsTable.post_id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

});