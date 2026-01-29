import { desc, sql, eq } from "drizzle-orm";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { followsTable } from "../db/schema/Follows.js";
import { db } from "../db/config.js";



// SUGGEST PEOPLE FOR YOU (Top Followed Users)
const getConnectionPeopleController = async (req, res, next) => {
    try {

        const currentUserId = req.user.user_id; // Auth middleware se user ID lein

        const topUsers = await db
            .select({
                id: usersTable.user_id,
                name: usersTable.name,
                username: usersTable.username,
                avatar: profilesTable.avatar,
                followersCount: sql`count(${followsTable.following_id})`.mapWith(Number),
                // Check if current user follows this person
                isFollowing: sql`EXISTS (
                    SELECT 1 FROM ${followsTable} 
                    WHERE ${followsTable.follower_id} = ${currentUserId} 
                    AND ${followsTable.following_id} = ${usersTable.user_id}
                )`.mapWith(Boolean),
            })
            .from(usersTable)
            .leftJoin(profilesTable, eq(usersTable.user_id, profilesTable.user_id))
            .leftJoin(followsTable, eq(usersTable.user_id, followsTable.following_id))
            .where(sql`${usersTable.user_id} != ${currentUserId}`) // Apne aap ko list se nikalne ke liye
            .groupBy(usersTable.user_id, profilesTable.avatar)
            .orderBy(desc(sql`count(${followsTable.following_id})`))
            .limit(10);

        return res.status(200).json({ success: true, data: topUsers });
    } catch (err) {
        next(err);
    }
}




export { getConnectionPeopleController }