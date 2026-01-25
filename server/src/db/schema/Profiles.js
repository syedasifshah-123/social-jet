import { pgTable, uuid, varchar, text, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


// GENDER ENUM
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);


export const profilesTable = pgTable("profiles", {

    profile_id: uuid("profile_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    avatar: varchar("avatar", { length: 500 }),
    banner_img: varchar("banner_img", { length: 500 }),
    bio: text("bio"),
    gender: genderEnum("gender").notNull().default("other"),
    location: varchar("location", { length: 100 }),
    country: varchar("country", { length: 100 }),
    birthdate: date("birthdate"),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

});