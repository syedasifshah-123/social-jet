import { and, eq, sql, desc, ne } from "drizzle-orm";
import { db } from "../db/config.js";
import { bookmarksTable } from "../db/schema/Bookmarks.js";
import { postsTable } from "../db/schema/Posts.js";
import { likesTable } from "../db/schema/Likes.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { usersTable } from "../db/schema/Users.js";




// GET ALL BOOKMARKED POSTS
const getBookmarkedPostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const bookmarks = await db.select({
            post_id: postsTable.post_id,
            content: postsTable.content,
            media_url: postsTable.media_url,
            created_at: postsTable.created_at,
            likesCount: sql`(SELECT count(*) FROM ${likesTable} WHERE ${likesTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
            isLiked: sql`EXISTS (SELECT 1 FROM ${likesTable} WHERE ${likesTable.post_id} = ${postsTable.post_id} AND ${likesTable.user_id} = ${userId})`.mapWith(Boolean),
            bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
            isBookmarked: sql`true`.mapWith(Boolean), // Kyunki hum bookmarks table se hi fetch kar rahe hain
            user: {
                name: usersTable.name,
                username: usersTable.username,
                avatar: profilesTable.avatar,
            },
        })
            .from(bookmarksTable)
            .innerJoin(postsTable, eq(bookmarksTable.post_id, postsTable.post_id))
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(eq(bookmarksTable.user_id, userId))
            .orderBy(desc(postsTable.created_at))
            .limit(limit)
            .offset(offset);


        res.status(200).json({
            success: true,
            data: bookmarks
        });

    } catch (err) {
        next(err);
    }
}





// SAVE POST CONTROLLER
const postSaveController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { postId } = req.params;


        // const existing = await db.query.bookmarksTable.findFirst({
        //     where: and(
        //         eq(bookmarksTable.user_id, userId),
        //         eq(postsTable.post_id, postId)
        //     )
        // });


        // if (existing) {
        //     return res.json({
        //         success: false,
        //         message: "Post is already in bookmark."
        //     });
        // }


        await db.insert(bookmarksTable).values({
            user_id: userId,
            post_id: postId
        }).returning();


        return res.status(200).json({
            success: true,
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



export { getBookmarkedPostsController, postSaveController, postUnSaveController }