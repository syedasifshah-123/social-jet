import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


export const oauthAccountsTable = pgTable("oauth_accounts", {

    oauth_id: uuid("oauth_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    provider_id: varchar("provider_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()

});