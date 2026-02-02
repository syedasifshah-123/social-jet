import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";
import { commentsTable } from "./Comments.js";
import { postsTable } from "./Posts.js";
import { likesTable } from "./Likes.js";
import { followsTable } from "./Follows.js";


// NOTIFICATION TYPE ENUM
export const notificationTypeEnum = pgEnum("notification_type", [
    "comment",
    "like",
    "follow",
    "message",
    "new_post"
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

    post_id: uuid("post_id")
        .references(() => postsTable.post_id, { onDelete: "cascade" }),

    comment_id: uuid("comment_id")
        .references(() => commentsTable.comment_id, { onDelete: "cascade" }),

    like_id: uuid("like_id")
        .references(() => likesTable.like_id, { onDelete: "cascade" }),

    follow_id: uuid("follow_id")
        .references(() => followsTable.follow_id, { onDelete: "cascade" }),

    is_read: boolean("is_read").default(false).notNull(),

    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});