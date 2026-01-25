import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";


export const userRoleEnum = pgEnum("role", ["admin", "user"]);

export const usersTable = pgTable("users", {

    user_id: uuid("user_id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    username: varchar("username", { length: 100 }).notNull().unique(),
    role: userRoleEnum("role").default("user"),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()

});