import { eq, inArray, desc, gte, and, notInArray, ne, or } from "drizzle-orm";
import { db } from "../db/config.js";
import { followsTable } from "../db/schema/Follows.js";
import { postsTable } from "../db/schema/Posts.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";




// GET FOR YOU POSTS CONTROLLER
const getAllForYouPostsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user; // current user id

        // Pagination Params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;


        // 1. Following IDs fetch karein
        const followingData = await db
            .select({ followingId: followsTable.following_id })
            .from(followsTable)
            .where(eq(followsTable.follower_id, userId));


        // all following ID's
        const followingIds = followingData.map((f) => f.followingId);


        const whereClause = followingIds.length > 0
            ? or(
                inArray(postsTable.user_id, followingIds), // Jinhe follow kiya unki posts
                and(
                    notInArray(postsTable.user_id, [...followingIds, userId]) // Discovery posts
                )
            )
            : ne(postsTable.user_id, userId); // Agar koi following nahi hai to sirf apni hide karein

        const feedPosts = await db
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
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(whereClause)
            .orderBy(desc(postsTable.created_at))
            .limit(limit)
            .offset(offset);

        // 3. Response
        res.status(200).json({
            success: true,
            data: feedPosts,
            // Agar posts ki tadad limit ke barabar hai, matlab mazeed posts ho sakti hain
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

        const feedPosts = await db
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
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.user_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(postsTable.user_id, profilesTable.user_id))
            .where(whereClause)
            .orderBy(desc(postsTable.created_at))
            .limit(limit)
            .offset(offset);
        

        // Response
        res.status(200).json({
            success: true,
            data: feedPosts,
            nextPage: feedPosts.length === limit ? page + 1 : null
        });

    } catch (err) {
        console.error("Following Feed Error:", err);
        next(err);
    }
};




// GET POST DETAIL CONTROLLER
const getPostDetailController = async (req, res, next) => {
    try {

        const { id: postId } = req.params;

        const post = await db.query.postsTable.findFirst({ where: eq(postsTable.post_id, postId) });

        if (!post) {
            throw new Error("Post not found!");
        }

        res.status(201).json({
            success: true,
            data: post
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

        const [newPost] = await db.insert(postsTable).values({
            user_id: userId,
            content,
            media_url: mediaUrl,
            media_type: mediaType,
        }).returning();


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

        const { id: userId } = req.user;
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


        const { id: userId } = req.user;
        const { id: postId } = req.params;


        const post = await db.query.postsTable.findFirst({ where: eq(postsTable.post_id, postId) });

        if (!post || post.user_id !== userId) {
            throw new Error("Not authorized to edit this post");
        }


        await db.delete(postsTable).where(eq(postsTable.post_id, postId));


        res.status(201).json({
            success: true,
            message: "Post deleted successfull!"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}






export {
    getAllForYouPostsController,
    getAllFollowingPostsController,
    getPostDetailController,
    createPostController,
    editPostController,
    deletePostController
};