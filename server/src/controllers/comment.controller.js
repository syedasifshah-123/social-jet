import { commentsTable } from "../db/schema/Comments.js";
import { db } from "../db/config.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { and, desc, eq } from "drizzle-orm";
import { notifyUser } from "../utils/notificationHelper.js";
import { postsTable } from "../db/schema/Posts.js";
import { deleteCacheByPattern } from "../utils/cacheHelper.js";




// GET POST COMMENTS CONTROLLER
const getPostCommentsController = async (req, res, next) => {
    try {

        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Post ID is required"
            });
        }

        // Database query
        const result = await db
            .select({
                userId: usersTable.user_id,
                commentId: commentsTable.comment_id,
                content: commentsTable.content,
                createdAt: commentsTable.created_at,
                name: usersTable.name,
                username: usersTable.username,
                avatar: profilesTable.avatar
            })
            .from(commentsTable)
            .innerJoin(
                usersTable,
                eq(commentsTable.user_id, usersTable.user_id)
            )
            .leftJoin(
                profilesTable,
                eq(usersTable.user_id, profilesTable.user_id)
            )
            .where(eq(commentsTable.post_id, postId))
            .orderBy(desc(commentsTable.created_at));


        // Format the response
        const data = result.map((row) => ({
            userId: row.userId,
            id: row.commentId,
            content: row.content,
            createdAt: row.createdAt,
            user: {
                name: row.name,
                username: row.username,
                avatar: row.avatar || null
            }
        }));


        return res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (err) {
        console.error("Comments Error:", err);
        next(err);
    }
}






// COMMENT POST CONTROLLER
const commentPostController = async (req, res, next) => {
    try {


        const { user_id: userId } = req.user;
        const { postId } = req.params;
        const { content } = req.body;


        if (!content || content.trim() === '') {
            return;
        }


        // new comment
        const [newComment] = await db.insert(commentsTable).values({
            post_id: postId,
            user_id: userId,
            content: content.trim()
        }).returning();



        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        if (!newComment) {
            throw new Error("Failed to create comment");
        }


        // Get user detail
        const [userDetails] = await db
            .select({
                user_id: usersTable.user_id,
                name: usersTable.name,
                username: usersTable.username,
                avatar: profilesTable.avatar,
            })
            .from(usersTable)
            .leftJoin(profilesTable, eq(usersTable.user_id, profilesTable.user_id))
            .where(eq(usersTable.user_id, userId));



        // get post
        const [post] = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.post_id, postId))
            .limit(1);


        // notify user using socket
        notifyUser({
            userId: post.user_id,
            senderId: userId,
            type: 'comment',
            content: `${userDetails?.name} commented your post`,
            postId: post.post_id,
            sender: {
                user_id: userDetails?.user_id,
                name: userDetails?.name,
                username: userDetails?.username,
                avatar: userDetails?.avatar
            }
        })


        // Response
        return res.status(201).json({
            success: true,
            data: {
                ...newComment,
                user: {
                    name: userDetails?.name || 'Unknown User',
                    username: userDetails?.username || 'unknown',
                    avatar: userDetails?.avatar || null
                }
            }
        });

    } catch (err) {
        console.error('Comment creation error:', err);
        next(err);
    }
}




// EDIT COMMENT CONTROLLER
const editCommentController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { commentId } = req.params;
        const { content } = req.body;


        if (!content || content.trim() === '') {
            return;
        }

        const [updatedComment] = await db
            .update(commentsTable)
            .set({ content })
            .where(and(
                eq(commentsTable.comment_id, commentId),
                eq(commentsTable.user_id, userId)
            )).returning();


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        if (!updatedComment) {
            throw new Error("Failed to edit comment");
        }

        // Response
        return res.status(200).json({
            success: true,
            message: "Comment updated."
        });


    } catch (err) {
        next(err);
    }
}




// DELETE COMMENT CONTROLLER
const deleteCommentController = async (req, res, next) => {
    try {

        const { commentId } = req.params;
        const { user_id: userId } = req.user;

        const result = await db
            .delete(commentsTable)
            .where(and(
                eq(commentsTable.comment_id, commentId),
                eq(commentsTable.user_id, userId)
            ))
            .returning();


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);

        if (result.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment or it doesn't exist."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Comment deleted."
        });

    } catch (err) {
        console.error("Delete Error:", err);
        next(err);
    }
}




export { getPostCommentsController, commentPostController, editCommentController, deleteCommentController }