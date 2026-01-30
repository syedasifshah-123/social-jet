import { postsTable } from "../db/schema/Posts.js";
import { likesTable } from "../db/schema/Likes.js";
import { db } from "../db/config.js";
import { and, eq } from "drizzle-orm";
import { usersTable } from "../db/schema/Users.js";




// POST LIKE CONTROLLER
const postLikeController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;


        const existing = await db.query.likesTable.findFirst({
            where: and(
                eq(likesTable.user_id, userId),
                eq(postsTable.post_id, postId)
            )
        });


        if (existing) {
            return res.status(400).json({ success: false, message: "Already liked this post" });
        }


        await db.insert(likesTable).values({
            user_id: userId,
            post_id: postId
        }).returning();


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

        return res.status(200).json({
            success: true
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}






export { postLikeController, postUnLikeController }