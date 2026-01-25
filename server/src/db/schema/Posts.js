import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "../schema/Users.js";



// MDEIA TYPE ENUM
export const mediaTypeEnum = pgEnum("media_type", ["video", "image"]);

export const postsTable = pgTable("posts", {

    post_id: uuid("post_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").notNull().references(() => usersTable.user_id, {
        onDelete: "cascade"
    }), 
    content: text("content").notNull(), 
    media_url: varchar("media_url", { length: 500 }),
    media_type: mediaTypeEnum("media_type").default("image"),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

});