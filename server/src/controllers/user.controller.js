import { db } from "../db/config.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { followsTable } from "../db/schema/Follows.js";
import { and, eq, sql } from "drizzle-orm";
import { postsTable } from "../db/index.js";



// GET USER PROFILE BY USERNAME
const getUserProfileController = async (req, res, next) => {
    try {

        const { user_id: currentUserId } = req.user;
        const { username } = req.params;

        // JOIN USER + PROFILE by username
        const userProfile = await db
            .select()
            .from(usersTable)
            .leftJoin(profilesTable, eq(usersTable.user_id, profilesTable.user_id))
            .where(eq(usersTable.username, username));


        if (!userProfile || userProfile.length === 0) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        const { users, profiles } = userProfile[0];
        const targetUserId = users.user_id;



        // posts count
        const postCount = await db
            .select({ count: sql`count(*)` })
            .from(postsTable)
            .where(eq(postsTable.user_id, targetUserId));


        // followers and following user count
        const followersCount = await db
            .select({ count: sql`count(*)` })
            .from(followsTable)
            .where(eq(followsTable.following_id, targetUserId));

        const followingCount = await db
            .select({ count: sql`count(*)` })
            .from(followsTable)
            .where(eq(followsTable.follower_id, targetUserId));


        // check user is followed or not
        let isFollowing = false;

        if (currentUserId && currentUserId !== targetUserId) {
            const followDoc = await db.query.followsTable.findFirst({
                where: and(
                    eq(followsTable.follower_id, currentUserId),
                    eq(followsTable.following_id, targetUserId)
                ),
            });
            isFollowing = !!followDoc; // if followed true else false
        }


        return res.status(200).json({
            success: true,
            data: {
                id: users.user_id,
                name: users.name,
                username: users.username,
                isVerified: users.isVerified,
                joinData: users?.createdAt,
                isFollowing: isFollowing,
                followersCount: Number(followersCount[0].count),
                followingCount: Number(followingCount[0].count),
                postCount: Number(postCount[0].count),
                profile: {
                    avatar: profiles?.avatar,
                    banner: profiles?.banner_img,
                    bio: profiles?.bio,
                },
            }
        });

    } catch (err) {
        console.error("Error in getProfileController:", err);
        next(err);
    }
};




export { getUserProfileController }