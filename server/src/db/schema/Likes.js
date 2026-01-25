import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";
import { postsTable } from "./Posts.js";

export const likesTable = pgTable("likes", {

    like_id: uuid("like_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    post_id: uuid("post_id")
        .notNull()
        .references(() => postsTable.post_id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});