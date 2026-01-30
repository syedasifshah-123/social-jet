import { and, eq } from "drizzle-orm";
import { db } from "../db/config";
import { bookmarksTable } from "../db/schema/Bookmarks.js";



// SAVE POST CONTROLLER
const postSaveController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;


        const existing = await db.query.bookmarksTable.findFirst({
            where: and(
                eq(bookmarksTable.user_id, userId),
                eq(bookmarksTable.post_id, postId),
            )
        });


        if (existing) {
            return res.json({
                success: false,
                message: "Post is already in bookmark."
            });
        }


        await db.insert(bookmarksTable).values({
            user_id: userId,
            post_id: postId
        }).returning();


        return res.status(200).json({
            success: false,
            message: "Post Bookmarked."
        });


    } catch (err) {
        console.log(err);
        next(err);
    }
}






// UNSAVE POST CONTROLLER
const postUnSaveController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;

        await db.delete(bookmarksTable).where(
            and(
                eq(bookmarksTable.user_id, userId),
                eq(bookmarksTable.post_id, postId)
            )
        );

        return res.status(200).json({
            success: true,
            message: "Post Unbookmarked."
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}



export { postSaveController, postUnSaveController }