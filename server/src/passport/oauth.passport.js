import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db/config.js";
import { usersTable } from "../db/schema/Users.js";
import { oauthAccountsTable } from "../db/schema/OAuthAccounts.js";
import { eq, and } from "drizzle-orm";
import { ENV } from "../config/env.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { generateUniqueUsername } from "../utils/username.js";




// GOOGLE STRATEGY
passport.use(

    new GoogleStrategy({
        clientID: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: ENV.GOOGLE_CALLBACK_URL
    },

        async (accessToken, refreshToken, profile, done) => {
            try {

                const email = profile.emails[0].value;


                // 1. CHECK OAUTH ACCOUNT
                const oauthAccount = await db.query.oauthAccountsTable.findFirst({
                    where: and(
                        eq(oauthAccountsTable.provider, "google"),
                        eq(oauthAccountsTable.provider_id, profile.id)
                    ),
                });


                if (oauthAccount) {
                    return done(null, { user_id: oauthAccount.user_id });
                }


                // 2. CHECK USER BY EMAIL
                let user = await db.query.usersTable.findFirst({
                    where: eq(usersTable.email, email),
                });


                // If user exists then link only oauth account
                if (user) {
                    await db.insert(oauthAccountsTable).values({
                        user_id: existingUser.user_id,
                        provider: "google",
                        provider_id: profile.id,
                    });

                    return done(null, { user_id: existingUser.user_id });
                }


                // 3. CREATE USER IF NOT EXISTS
                let newUser;

                await db.transaction(async (tx) => {

                    [newUser] = await tx.insert(usersTable).values({
                        name: profile.displayName,
                        email,
                        username: generateUniqueUsername(email),
                        isVerified: true
                    }).returning();


                    // PROFILE INSERTIONS
                    await tx.insert(profilesTable).values({
                        user_id: newUser.user_id,
                        avatar: profile.photos?.[0]?.value || null
                    }).returning();


                    // OAUTH ACCOUNTS
                    await tx.insert(oauthAccountsTable).values({
                        user_id: newUser.user_id,
                        provider: "google",
                        provider_id: profile.id
                    }).returning();

                });

                return done(null, { user_id: newUser.user_id });

            } catch (err) {
                return done(err, null);
            }
        }

    ));