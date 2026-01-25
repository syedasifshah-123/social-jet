import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


export const messagesTable = pgTable("messages", {

    message_id: uuid("message_id").defaultRandom().primaryKey(),
    sender_id: uuid("sender_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    receiver_id: uuid("receiver_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});