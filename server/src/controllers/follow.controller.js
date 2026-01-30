import { and, eq } from "drizzle-orm";
import { db } from "../db/config.js";
import { followsTable } from "../db/schema/Follows.js";




// FOLLOW USER CONTROLLER
const followUserController = async (req, res, next) => {
    try {


        const { user_id: followerId } = req.user;       // CURRENT USER ID
        const { id: userIdToFollow } = req.params;  // TARGET USER ID


        // CANNOT FOLLOW YOUR SELF
        if (followerId === userIdToFollow) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        // CHECK IF ALREADY FOLLOWING
        const existing = await db.query.followsTable.findFirst({
            where: and(
                eq(followsTable.follower_id, followerId),
                eq(followsTable.following_id, userIdToFollow)),
        });
        

        if (existing) {
            return res.status(400).json({ success: false, message: "Already following this user" });
        }

        // INSERT FOLLOW
        await db.insert(followsTable).values({
            follower_id: followerId,
            following_id: userIdToFollow,
        }).returning();

        res.json({
            success: true,
            message: "User followed successful!"
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};





// UNFOLLOW USER CONTROLLER
const unFollowUserController = async (req, res, next) => {
    try {

        const { user_id: followerId } = req.user;                  // CURRENT USER ID
        const { id: userIdToUnFollow } = req.params;     // TARGET USER ID


        // CANNOT UNFLLOW YOURSEFL
        if (followerId === userIdToUnFollow) {
            return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
        }


        // CHECK IF USER ALREADY FOLLOWING 
        const existing = await db.query.followsTable.findFirst({
            where: and(
                eq(followsTable.follower_id, followerId),
                eq(followsTable.following_id, userIdToUnFollow)
            ),
        });

        if (!existing) {
            return res.status(400).json({ success: false, message: "You are not following this user" });
        }


        // DELETE FOLLOW RECORD 
        await db.delete(followsTable).where(
            and(
                eq(followsTable.follower_id, followerId),
                eq(followsTable.following_id, userIdToUnFollow)
            )
        );

        res.json({
            success: true,
            message: "User unfollowed successfully!",
        });

    } catch (err) {
        console.error("Error in unFollowUserController:", err);
        next(err);
    }
};





export {
    followUserController,
    unFollowUserController
};