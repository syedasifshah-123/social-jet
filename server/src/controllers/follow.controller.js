import { and, eq } from "drizzle-orm";
import { db } from "../db/config.js";
import { followsTable } from "../db/schema/Follows.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { usersTable } from "../db/schema/Users.js";
import { notifyUser } from "../utils/notificationHelper.js";




// FOLLOW USER CONTROLLER
// const followUserController = async (req, res, next) => {
//     try {


//         const { user_id: followerId } = req.user;       // CURRENT USER ID
//         const { id: userIdToFollow } = req.params;  // TARGET USER ID


//         // CANNOT FOLLOW YOUR SELF
//         if (followerId === userIdToFollow) {
//             return res.status(400).json({ success: false, message: "You cannot follow yourself" });
//         }


//         // CHECK IF ALREADY FOLLOWING
//         const existing = await db.query.followsTable.findFirst({
//             where: and(
//                 eq(followsTable.follower_id, followerId),
//                 eq(followsTable.following_id, userIdToFollow)),
//         });


//         if (existing) {
//             return res.status(400).json({ success: false, message: "Already following this user" });
//         }


//         const [follower] = await db
//             .select({
//                 user_id: usersTable.user_id,
//                 username: usersTable.username,
//                 name: usersTable.name,
//             })
//             .from(usersTable)
//             .where(eq(usersTable.user_id, followerId))
//             .limit(1);

//         const [followerProfile] = await db
//             .select({ avatar: profilesTable.avatar })
//             .from(profilesTable)
//             .where(eq(profilesTable.user_id, followerId))
//             .limit(1);


//         // INSERT FOLLOW
//         const [newFollow] = await db.insert(followsTable).values({
//             follower_id: followerId,
//             following_id: userIdToFollow,
//         }).returning();


//         // Notify user
//         notifyUser({
//             userId: userIdToFollow,
//             senderId: followerId,
//             type: 'follow',
//             content: `${follower.name} started following you`,
//             follow_id: newFollow.follow_id,
//             sender: {
//                 user_id: follower.user_id,
//                 name: follower.name,
//                 username: follower.username,
//                 avatar: followerProfile?.avatar
//             }
//         }).catch(err => {
//             console.error('Error sending notification:', err);
//         });


//         res.json({
//             success: true,
//             message: "User followed successful!"
//         });

//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// };


// src/controllers/followController.js


// FOLLOW USER
const followUserController = async (req, res, next) => {
    try {
        const followerId = req.user.user_id;
        const { id: followingId } = req.params;

        // Cannot follow yourself
        if (followerId === followingId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        // Check if already following
        const existingFollow = await db
            .select()
            .from(followsTable)
            .where(and(
                eq(followsTable.follower_id, followerId),
                eq(followsTable.following_id, followingId)
            ))
            .limit(1);

        if (existingFollow.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You are already following this user"
            });
        }

        // Get follower details
        const [follower] = await db
            .select({
                user_id: usersTable.user_id,
                username: usersTable.username,
                name: usersTable.name,
            })
            .from(usersTable)
            .where(eq(usersTable.user_id, followerId))
            .limit(1);

        const [followerProfile] = await db
            .select({ avatar: profilesTable.avatar })
            .from(profilesTable)
            .where(eq(profilesTable.user_id, followerId))
            .limit(1);

        // Create follow
        const [newFollow] = await db
            .insert(followsTable)
            .values({
                follower_id: followerId,
                following_id: followingId
            })
            .returning();

        // ✅ Send notification (background)
        notifyUser({
            userId: followingId,
            senderId: followerId,
            type: 'follow',
            content: `${follower.name} started following you`,
            followId: newFollow.follow_id,
            sender: {
                user_id: follower.user_id,
                name: follower.name,
                username: follower.username,
                avatar: followerProfile?.avatar
            }
        }).catch(err => {
            console.error('Error sending notification:', err);
        });

        res.status(201).json({
            success: true,
            message: "User followed successfully!",
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