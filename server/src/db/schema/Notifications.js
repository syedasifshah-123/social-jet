import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


// NOTIFICATION TYPE ENUM
export const notificationTypeEnum = pgEnum("notification_type", [
    "comment",
    "like",
    "follow",
    "message",
]);


export const notificationsTable = pgTable("notifications", {

    notification_id: uuid("notification_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    actor_id: uuid("actor_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message"),
    reference_id: uuid("reference_id"),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});