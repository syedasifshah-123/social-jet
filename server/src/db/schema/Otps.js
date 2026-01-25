import { pgTable, uuid, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./Users.js";


// OTYP TYPE ENum
export const otpTypeEnum = pgEnum("otp_type", ["verify", "reset"]);


export const otpsTable = pgTable("otps", {

    otp_id: uuid("otp_id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => usersTable.user_id, { onDelete: "cascade" }),
    otp_type: otpTypeEnum("otp_type").notNull().default("verify"),
    otp: varchar("otp", { length: 6 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    expires_at: timestamp("expires_at")

});