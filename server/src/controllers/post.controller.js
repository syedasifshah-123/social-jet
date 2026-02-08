import { eq, inArray, desc, notInArray, ne, or, sql, and } from "drizzle-orm";
import { db } from "../db/config.js";
import { followsTable } from "../db/schema/Follows.js";
import { postsTable } from "../db/schema/Posts.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { likesTable } from "../db/schema/Likes.js";
import { bookmarksTable } from "../db/schema/Bookmarks.js";
import { notifyFollowers } from "../utils/notificationHelper.js";
import { commentsTable } from "../db//schema/Comments.js";
import { postViewsTable } from "../db/schema/PostViews.js"
import { deleteCacheByPattern, getCache, setCache } from "../utils/cacheHelper.js";





// GET FOR YOU POSTS CONTROLLER
const getAllForYouPostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;


        // cache key for redis
        const cacheKey = `feed:${userId}:foryou:page:${page}:limit:${limit}`;
        let feedPosts = await getCache(cacheKey);


        if (feedPosts) {
            return res.status(200).json({
                success: true,
                data: feedPosts,
                cached: true,
                nextPage: feedPosts.length === limit ? page + 1 : null
            });
        }

        console.log(feedPosts);

        // IF CACHE MISS THEN DB QUERY

        // 1. Following IDs fetch karein
        const followingData = await db
            .select({ followingId: followsTable.following_id })
            .from(followsTable)
            .where(eq(followsTable.follower_id, userId));


        const followingIds = followingData.map((f) => f.followingId);

        const whereClause = followingIds.length > 0
            ? or(
                inArray(postsTable.user_id, followingIds),
                notInArray(postsTable.user_id, [...followingIds, userId])
            )
            : ne(postsTable.user_id, userId);


        // 2. Feed Posts with Likes Count and IsLiked Status
        feedPosts = await db
            .select({
                post_id: postsTable.post_id,
                content: postsTable.content,
                media_url: postsTable.media_url,
                created_at: postsTable.created_at,
                user: {
                    name: usersTable.name,
                    username: usersTable.username,
                    avatar: profilesTable.avatar,
                },

                // Views count
                viewsCount: postsTable.views_count,

                // LIKES COUNT
                likesCount: sql` (
                    SELECT count(*) FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),


                // IS LIKED BY CURRENT USER
                isLiked: sql` EXISTS (
                    SELECT 1 FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id} 
                    AND ${likesTable.user_id} = ${userId}
                )`.mapWith(Boolean),

                // bookmark count
                bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
                isBookmarked: sql`EXISTS (SELECT 1 FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id} AND ${bookmarksTable.user_id} = ${userId})`.mapWith(Boolean),

                // comments count
                commentsCount: sql`(
                    SELECT count(*) from ${commentsTable}
                    WHERE ${commentsTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),

                // is commented or not
                isCommented: sql`(
                    EXISTS (SELECT 1 FROM ${commentsTable} WHERE ${commentsTable.post_id} = ${postsTable.post_id} AND ${commentsTable.user_id} = ${userId})
                )`.mapWith(Boolean)

            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(whereClause)
            .orderBy(desc(postsTable.created_at))
            .limit(limit)
            .offset(offset);


        // SAVE IN REDIS FOR 3 MIN
        await setCache(cacheKey, feedPosts, 180);

        res.status(200).json({
            success: true,
            data: feedPosts,
            cached: false,
            nextPage: feedPosts.length === limit ? page + 1 : null
        });

    } catch (err) {
        console.error("Feed Error:", err);
        next(err);
    }
};






// GET ALL FOLLOWING POSTS CONTROLLER
const getAllFollowingPostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;


        // REDIS CACHE KEY
        const cacheKey = `feed:${userId}:following:page:${page}:limit:${limit}`;
        let feedPosts = await getCache(cacheKey);


        if (feedPosts) {
            return res.status(200).json({
                success: true,
                data: feedPosts,
                cached: true,
                nextPage: feedPosts.length === limit ? page + 1 : null
            });
        }


        //  Fetch following ID's
        const followingData = await db
            .select({ followingId: followsTable.following_id })
            .from(followsTable)
            .where(eq(followsTable.follower_id, userId));


        const followingIds = followingData.map((f) => f.followingId);

        // if no users follow to send empty array
        if (followingIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                nextPage: null
            });
        }

        // Only following users post
        const whereClause = inArray(postsTable.user_id, followingIds);

        feedPosts = await db
            .select({
                post_id: postsTable.post_id,
                content: postsTable.content,
                media_url: postsTable.media_url,
                created_at: postsTable.created_at,

                // Views count
                viewsCount: postsTable.views_count,

                likesCount: sql` (
                    SELECT count(*) FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),
                // IS LIKED BY CURRENT USER
                isLiked: sql` EXISTS (
                    SELECT 1 FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id} 
                    AND ${likesTable.user_id} = ${userId}
                )`.mapWith(Boolean),
                bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
                isBookmarked: sql`EXISTS (SELECT 1 FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id} AND ${bookmarksTable.user_id} = ${userId})`.mapWith(Boolean),

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
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(whereClause)
            .orderBy(desc(postsTable.created_at))
            .limit(limit)
            .offset(offset);



        // SET FEEDS IN REDIS
        await setCache(cacheKey, feedPosts, 180);

        // Response
        res.status(200).json({
            success: true,
            data: feedPosts,
            cached: false,
            nextPage: feedPosts.length === limit ? page + 1 : null
        });

    } catch (err) {
        console.error("Following Feed Error:", err);
        next(err);
    }
};





// GET ALL EXPLORE POST CONTROLLER
const getAllExplorePostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;


        // CACHE KEY FOR REDIS
        const cacheKey = `feed:${userId}:explore:page:${page}:limit:${limit}`;
        let explorePosts = await getCache(cacheKey);


        // if data in redis then get from redis
        if (explorePosts) {
            return res.status(200).json({
                success: true,
                data: explorePosts,
                cached: true,
                nextPage: explorePosts.length === limit ? page + 1 : null
            });
        }

        explorePosts = await db
            .select({
                post_id: postsTable.post_id,
                content: postsTable.content,
                media_url: postsTable.media_url,
                created_at: postsTable.created_at,


                // Views count
                viewsCount: postsTable.views_count,

                likesCount: sql` (
                    SELECT count(*) FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),

                // IS LIKED BY CURRENT USER
                isLiked: sql` EXISTS (
                    SELECT 1 FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id} 
                    AND ${likesTable.user_id} = ${userId}
                )`.mapWith(Boolean),
                bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
                isBookmarked: sql`EXISTS (SELECT 1 FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id} AND ${bookmarksTable.user_id} = ${userId})`.mapWith(Boolean),

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
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(ne(postsTable.user_id, userId))
            .orderBy((t) => [
                desc(postsTable.created_at)
            ])
            .limit(limit)
            .offset(offset);


        // CACHE DATA IN REDIS
        await setCache(cacheKey, explorePosts, 180);

        res.status(200).json({
            success: true,
            data: explorePosts,
            cached: false,
            nextPage: explorePosts.length === limit ? page + 1 : null
        });

    } catch (err) {
        console.error("Explore Feed Error:", err);
        next(err);
    }
};





// GET POST DETAIL CONTROLLER
const getPostDetailController = async (req, res, next) => {
    try {

        const { id: postId } = req.params;
        const { user_id: userId } = req.user;


        const [singlePost] = await db
            .select({
                post_id: postsTable.post_id,
                content: postsTable.content,
                media_url: postsTable.media_url,
                created_at: postsTable.created_at,

                // Views count
                viewsCount: postsTable.views_count,

                likesCount: sql` (
                    SELECT count(*) FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id}
                )`.mapWith(Number),

                // IS LIKED BY CURRENT USER
                isLiked: sql` EXISTS (
                    SELECT 1 FROM ${likesTable} 
                    WHERE ${likesTable.post_id} = ${postsTable.post_id} 
                    AND ${likesTable.user_id} = ${userId}
                )`.mapWith(Boolean),

                bookmarkCount: sql`(SELECT count(*) FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id})`.mapWith(Number),
                isBookmarked: sql`EXISTS (SELECT 1 FROM ${bookmarksTable} WHERE ${bookmarksTable.post_id} = ${postsTable.post_id} AND ${bookmarksTable.user_id} = ${userId})`.mapWith(Boolean),

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
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(eq(postsTable.post_id, postId));

        if (!singlePost) {
            throw new Error("Post not found!");
        }

        res.status(201).json({
            success: true,
            data: singlePost
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// CREATE POST CONTROLLER
const createPostController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { content } = req.body;
        const file = req.file;


        let mediaUrl = null;
        let mediaType = null;


        if (file) {
            mediaUrl = req.file.path;
            mediaType = req.file.mimetype.split("/")[0];
        }


        if (!userId) {
            throw new Errror("User not authenticated");
        }


        // get user from db
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.user_id, userId),
            columns: {
                user_id: true,
                username: true,
                name: true
            }
        });


        // get profile
        const userProfile = await db.query.profilesTable.findFirst({
            where: eq(profilesTable.user_id, userId),
            columns: {
                avatar: true
            }
        });


        // create new post
        const [newPost] = await db.insert(postsTable).values({
            user_id: userId,
            content,
            media_url: mediaUrl,
            media_type: mediaType,
        }).returning();



        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        // get all followers
        const followers = await db
            .select({ follower_id: followsTable.follower_id })
            .from(followsTable)
            .where(eq(followsTable.following_id, userId));


        if (followers.length > 0) {

            const postDataForNotification = {
                ...newPost,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    username: user.username,
                    avatar: userProfile?.avatar
                }
            }

            // socket real time
            notifyFollowers(postDataForNotification, followers).catch(err => {
                console.log(err);
            });

        }


        res.status(201).json({
            success: true,
            message: "Post created successfull!",
            data: {
                ...newPost,
                user: {
                    name: user.name,
                    username: user.username,
                    avatar: userProfile.avatar
                }
            }
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// EDIT POST CONTROLLER
const editPostController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { id: postId } = req.params;
        const { content } = req.body;

        const post = await db.query.postsTable.findFirst({ where: eq(postsTable.post_id, postId) });

        if (!post || post.user_id !== userId) {
            throw new Error("Not authorized to edit this post");
        }


        let mediaUrl = post.media_url;
        let mediaType = post.media_type;


        if (req.file) {
            mediaUrl = req.file.path;
            mediaType = req.file.mimetype.split("/")[0];
        }


        await db.update(postsTable).set({
            content: content ?? post.content,
            media_url: mediaUrl,
            media_type: mediaType,
            updated_at: new Date()
        }).where(eq(postsTable.post_id, postId)).returning();


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        res.status(201).json({
            success: true,
            message: "Post updated successfull!"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// DELETE POST CONTROLLER
const deletePostController = async (req, res, next) => {
    try {


        const { user_id: userId } = req.user;
        const { id: postId } = req.params;


        const post = await db.query.postsTable.findFirst({ where: eq(postsTable.post_id, postId) });

        if (!post || post.user_id !== userId) {
            throw new Error("Not authorized to edit this post");
        }


        await db.delete(postsTable).where(eq(postsTable.post_id, postId));


        // DELETE CACHE KEY
        await deleteCacheByPattern(`feed:${userId}:foryou:*`);
        await deleteCacheByPattern(`feed:${userId}:following:*`);
        await deleteCacheByPattern(`feed:${userId}:explore:*`);
        await deleteCacheByPattern(`feed:${userId}:bookmarks:*`);


        res.status(201).json({
            success: true,
            message: "Post deleted successfull!"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// TRACK POST VIEW CONTROLLER
const trackPostViewController = async (req, res, next) => {
    try {

        const { postId: post_id } = req.params;
        const { user_id: userId } = req.user;


        // Check if post exists
        const post = await db
            .select({ user_id: postsTable.user_id })
            .from(postsTable)
            .where(eq(postsTable.post_id, post_id))
            .limit(1);

        if (!post.length) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Don't count own posts
        if (post[0].user_id === userId) {
            return res.status(200).json({
                success: true,
                message: 'Own post - view not counted'
            });
        }

        // Check if already viewed in last 24 hours
        const existingView = await db
            .select()
            .from(postViewsTable)
            .where(
                and(
                    eq(postViewsTable.post_id, post_id),
                    eq(postViewsTable.user_id, userId),
                    sql`${postViewsTable.viewed_at} > NOW() - INTERVAL '24 hours'`
                )
            )
            .limit(1);

        if (existingView.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Already viewed in last 24 hours'
            });
        }

        // Get IP and User Agent (optional)
        const ipAddress = req.ip ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Insert view record
        await db.insert(postViewsTable).values({
            post_id,
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
        });

        // Increment views_count in posts table
        await db
            .update(postsTable)
            .set({
                views_count: sql`${postsTable.views_count} + 1`
            })
            .where(eq(postsTable.post_id, post_id));

        res.status(200).json({
            success: true,
            message: 'View tracked successfully'
        });

    } catch (err) {
        console.error("Track View Error:", err);
        next(err);
    }
};





export {
    getAllForYouPostsController,
    getAllFollowingPostsController,
    getAllExplorePostsController,
    getPostDetailController,
    createPostController,
    editPostController,
    deletePostController,
    trackPostViewController
};