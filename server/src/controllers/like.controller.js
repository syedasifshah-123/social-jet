import { postsTable } from "../db/schema/Posts.js";
import { likesTable } from "../db/schema/Likes.js";
import { db } from "../db/config.js";
import { and, eq } from "drizzle-orm";
import { notifyUser } from "../utils/notificationHelper.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { usersTable } from "../db/schema/Users.js";
import { deleteCacheByPattern } from "../utils/cacheHelper.js";




// POST LIKE CONTROLLER
const postLikeController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;


        const existing = await db.query.likesTable.findFirst({
            where: and(
                eq(likesTable.user_id, userId),
                eq(likesTable.post_id, postId)
            )
        });


        if (existing) {
            return res.status(400).json({ success: false, message: "Already liked this post" });
        }


        // GET post
        const [post] = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.post_id, postId))
            .limit(1);


        // User detail
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.user_id, userId),
            columns: {
                user_id: true,
                username: true,
                name: true
            }
        });


        const userProfile = await db.query.profilesTable.findFirst({
            where: eq(profilesTable.user_id, userId),
            columns: {
                avatar: true
            }
        });


        // insertions in likes table
        await db.insert(likesTable).values({
            user_id: userId,
            post_id: postId
        }).returning();


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        notifyUser({
            userId: post.user_id,
            senderId: userId,
            type: 'like',
            content: `${user.name} liked your post`,
            postId: post.post_id,
            sender: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                avatar: userProfile?.avatar
            }
        }).catch(err => {
            console.error('Error sending notification:', err);
        });


        res.json({
            success: true,
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}






// POST UNLIKE CONTROLLER
const postUnLikeController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;


        await db.delete(likesTable).where(
            and(
                eq(likesTable.user_id, userId),
                eq(likesTable.post_id, postId)
            )
        );


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);

        return res.status(200).json({
            success: true
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}






export { postLikeController, postUnLikeController }