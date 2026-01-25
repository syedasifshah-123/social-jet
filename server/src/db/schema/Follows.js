import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


export const followsTable = pgTable("follows", {

    follow_id: uuid("follow_id").defaultRandom().primaryKey(),
    follower_id: uuid("follower_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    following_id: uuid("following_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});