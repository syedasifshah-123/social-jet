import { and, eq, sql, desc } from "drizzle-orm";
import { db } from "../db/config.js";
import { bookmarksTable } from "../db/schema/Bookmarks.js";
import { postsTable } from "../db/schema/Posts.js";
import { likesTable } from "../db/schema/Likes.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { usersTable } from "../db/schema/Users.js";
import { commentsTable } from "../db/schema/Comments.js";
import { deleteCacheByPattern, getCache, setCache } from "../utils/cacheHelper.js";




// GET ALL BOOKMARKED POSTS
const getBookmarkedPostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;


        // SAVE DATA IN CACHE
        const cacheKey = `feed:${userId}:bookmarks:page:${page}:limit:${limit}`;
        let bookmarksPosts = await getCache(cacheKey);


        if (bookmarksPosts) {
            return res.status(200).json({
                success: true,
                data: bookmarksPosts,
                cached: true
            });
        }


        bookmarksPosts = await db.select({
            post_id: postsTable.post_id,
            content: postsTable.content,
            media_url: postsTable.media_url,
            created_at: postsTable.created_at,
            likesCount: sql`(SELECT count(*) FROM ${likesTable} WHERE ${likesTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
            isLiked: sql`EXISTS (SELECT 1 FROM ${likesTable} WHERE ${likesTable.post_id} = ${postsTable.post_id} AND ${likesTable.user_id} = ${userId})`.mapWith(Boolean),
            bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
            isBookmarked: sql`true`.mapWith(Boolean),

            // comments count
            commentsCount: sql`(
                SELECT count(*) from ${commentsTable}
                WHERE ${commentsTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),

            // is commented or not
            isCommented: sql`(
                EXISTS (SELECT 1 FROM ${commentsTable} WHERE ${commentsTable.post_id} = ${postsTable.post_id} AND ${commentsTable.user_id} = ${userId})
            )`.mapWith(Boolean),

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


        // SAVE IN REDIS CACHE
        await setCache(cacheKey, bookmarksPosts, 180);

        res.status(200).json({
            success: true,
            data: bookmarksPosts
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


        await db.insert(bookmarksTable).values({
            user_id: userId,
            post_id: postId
        }).returning();


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);

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


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


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