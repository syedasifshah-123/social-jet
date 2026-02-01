Bilkul bhai! Main tumhe **complete backend APIs** deta hoon notifications ke liye! 🚀

---

# 🔥 Complete Backend - Notification APIs

---

## 📁 **Backend File Structure**

```
server/
├── src/
│   ├── server.js                           # Main entry
│   ├── socket/
│   │   ├── index.js                        # Socket setup
│   │   ├── handlers/
│   │   │   ├── connectionHandler.js        # Connection/Disconnect
│   │   │   └── notificationHandler.js      # Notification events
│   │   └── utils/
│   │       ├── onlineUsers.js              # Online users manager
│   │       └── emitHelper.js               # Emit utilities
│   ├── controllers/
│   │   ├── notificationController.js       # Notification CRUD
│   │   ├── postController.js               # Post with notifications
│   │   ├── likeController.js               # Like with notifications
│   │   ├── commentController.js            # Comment with notifications
│   │   └── followController.js             # Follow with notifications
│   ├── routes/
│   │   └── notificationRoutes.js           # Notification routes
│   ├── middleware/
│   │   └── authMiddleware.js               # JWT auth
│   └── utils/
│       └── notificationHelper.js           # Notification helpers
```

---

## 1️⃣ **Server Setup** (Main File)

```javascript
// src/server.js

import express from "express";
import http from "http";
import cors from "cors";
import socketIO from "./socket/index.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Initialize Socket.IO
socketIO.init(server);

// Import routes
import notificationRoutes from "./routes/notificationRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import followRoutes from "./routes/followRoutes.js";

// Use routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        onlineUsers: socketIO.getOnlineUsersCount()
    });
});

const PORT = process.env.PORT || 5510;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
```

---

## 2️⃣ **Notification Routes**

```javascript
// src/routes/notificationRoutes.js

import express from "express";
import {
    getNotificationsController,
    getUnreadCountController,
    markAsReadController,
    markAllAsReadController,
    deleteNotificationController
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get all notifications
router.get("/", getNotificationsController);

// GET /api/notifications/unread-count - Get unread count
router.get("/unread-count", getUnreadCountController);

// PATCH /api/notifications/:notificationId/read - Mark as read
router.patch("/:notificationId/read", markAsReadController);

// PATCH /api/notifications/mark-all-read - Mark all as read
router.patch("/mark-all-read", markAllAsReadController);

// DELETE /api/notifications/:notificationId - Delete notification
router.delete("/:notificationId", deleteNotificationController);

export default router;
```

---

## 3️⃣ **Notification Controller**

```javascript
// src/controllers/notificationController.js

import { db } from "../db/config.js";
import { notificationsTable, usersTable, profilesTable } from "../db/schema/index.js";
import { eq, desc, and } from "drizzle-orm";

// GET ALL NOTIFICATIONS
export const getNotificationsController = async (req, res, next) => {
    try {
        const userId = req.user.user_id; // From auth middleware

        // Fetch notifications with sender details
        const notifications = await db
            .select({
                notification_id: notificationsTable.notification_id,
                user_id: notificationsTable.user_id,
                actor_id: notificationsTable.actor_id,
                type: notificationsTable.type,
                message: notificationsTable.message,
                post_id: notificationsTable.post_id,
                comment_id: notificationsTable.comment_id,
                is_read: notificationsTable.is_read,
                created_at: notificationsTable.created_at,
                // Sender info
                sender_id: usersTable.user_id,
                sender_name: usersTable.name,
                sender_username: usersTable.username,
                sender_avatar: profilesTable.avatar
            })
            .from(notificationsTable)
            .leftJoin(usersTable, eq(notificationsTable.actor_id, usersTable.user_id))
            .leftJoin(profilesTable, eq(usersTable.user_id, profilesTable.user_id))
            .where(eq(notificationsTable.user_id, userId))
            .orderBy(desc(notificationsTable.created_at))
            .limit(50);

        // Format notifications
        const formattedNotifications = notifications.map(n => ({
            notification_id: n.notification_id,
            user_id: n.user_id,
            actor_id: n.actor_id,
            type: n.type,
            message: n.message,
            post_id: n.post_id,
            comment_id: n.comment_id,
            is_read: n.is_read,
            created_at: n.created_at,
            sender: {
                user_id: n.sender_id,
                name: n.sender_name,
                username: n.sender_username,
                avatar: n.sender_avatar
            }
        }));

        // Count unread
        const unreadCount = formattedNotifications.filter(n => !n.is_read).length;

        res.status(200).json({
            success: true,
            data: {
                notifications: formattedNotifications,
                unreadCount
            }
        });

    } catch (err) {
        console.error("Error fetching notifications:", err);
        next(err);
    }
};

// GET UNREAD COUNT
export const getUnreadCountController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const unreadNotifications = await db
            .select()
            .from(notificationsTable)
            .where(and(
                eq(notificationsTable.user_id, userId),
                eq(notificationsTable.is_read, false)
            ));

        res.status(200).json({
            success: true,
            data: {
                unreadCount: unreadNotifications.length
            }
        });

    } catch (err) {
        console.error("Error getting unread count:", err);
        next(err);
    }
};

// MARK NOTIFICATION AS READ
export const markAsReadController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { notificationId } = req.params;

        // Update notification
        const [updatedNotification] = await db
            .update(notificationsTable)
            .set({ is_read: true })
            .where(and(
                eq(notificationsTable.notification_id, notificationId),
                eq(notificationsTable.user_id, userId)
            ))
            .returning();

        if (!updatedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: updatedNotification
        });

    } catch (err) {
        console.error("Error marking as read:", err);
        next(err);
    }
};

// MARK ALL AS READ
export const markAllAsReadController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        await db
            .update(notificationsTable)
            .set({ is_read: true })
            .where(and(
                eq(notificationsTable.user_id, userId),
                eq(notificationsTable.is_read, false)
            ));

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (err) {
        console.error("Error marking all as read:", err);
        next(err);
    }
};

// DELETE NOTIFICATION
export const deleteNotificationController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { notificationId } = req.params;

        const [deletedNotification] = await db
            .delete(notificationsTable)
            .where(and(
                eq(notificationsTable.notification_id, notificationId),
                eq(notificationsTable.user_id, userId)
            ))
            .returning();

        if (!deletedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted"
        });

    } catch (err) {
        console.error("Error deleting notification:", err);
        next(err);
    }
};
```

---

## 4️⃣ **Like Controller (With Notification)**

```javascript
// src/controllers/likeController.js

import { db } from "../db/config.js";
import { likesTable, postsTable, usersTable, profilesTable } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { notifyUser } from "../utils/notificationHelper.js";

// LIKE POST
export const likePostController = async (req, res, next) => {
    try {
        const userId = req.user.user_id; // From auth middleware
        const { postId } = req.params;

        // Check if already liked
        const existingLike = await db
            .select()
            .from(likesTable)
            .where(and(
                eq(likesTable.user_id, userId),
                eq(likesTable.post_id, postId)
            ))
            .limit(1);

        if (existingLike.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You already liked this post"
            });
        }

        // Get post details
        const [post] = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.post_id, postId))
            .limit(1);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Get current user details
        const [user] = await db
            .select({
                user_id: usersTable.user_id,
                username: usersTable.username,
                name: usersTable.name,
            })
            .from(usersTable)
            .where(eq(usersTable.user_id, userId))
            .limit(1);

        const [userProfile] = await db
            .select({ avatar: profilesTable.avatar })
            .from(profilesTable)
            .where(eq(profilesTable.user_id, userId))
            .limit(1);

        // Create like
        const [newLike] = await db
            .insert(likesTable)
            .values({
                user_id: userId,
                post_id: postId
            })
            .returning();

        // ✅ Send notification (background)
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

        res.status(201).json({
            success: true,
            message: "Post liked successfully!",
            data: newLike
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};

// UNLIKE POST
export const unlikePostController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { postId } = req.params;

        const [deletedLike] = await db
            .delete(likesTable)
            .where(and(
                eq(likesTable.user_id, userId),
                eq(likesTable.post_id, postId)
            ))
            .returning();

        if (!deletedLike) {
            return res.status(404).json({
                success: false,
                message: "Like not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Post unliked successfully!"
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

---

## 5️⃣ **Comment Controller (With Notification)**

```javascript
// src/controllers/commentController.js

import { db } from "../db/config.js";
import { commentsTable, postsTable, usersTable, profilesTable } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { notifyUser } from "../utils/notificationHelper.js";

// CREATE COMMENT
export const createCommentController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }

        // Get post
        const [post] = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.post_id, postId))
            .limit(1);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Get commenter details
        const [user] = await db
            .select({
                user_id: usersTable.user_id,
                username: usersTable.username,
                name: usersTable.name,
            })
            .from(usersTable)
            .where(eq(usersTable.user_id, userId))
            .limit(1);

        const [userProfile] = await db
            .select({ avatar: profilesTable.avatar })
            .from(profilesTable)
            .where(eq(profilesTable.user_id, userId))
            .limit(1);

        // Create comment
        const [newComment] = await db
            .insert(commentsTable)
            .values({
                post_id: postId,
                user_id: userId,
                content: content.trim()
            })
            .returning();

        // ✅ Send notification (background)
        notifyUser({
            userId: post.user_id,
            senderId: userId,
            type: 'comment',
            content: `${user.name} commented on your post`,
            postId: post.post_id,
            commentId: newComment.comment_id,
            sender: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                avatar: userProfile?.avatar
            }
        }).catch(err => {
            console.error('Error sending notification:', err);
        });

        res.status(201).json({
            success: true,
            message: "Comment added successfully!",
            data: {
                ...newComment,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    username: user.username,
                    avatar: userProfile?.avatar
                }
            }
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

---

## 6️⃣ **Follow Controller (With Notification)**

```javascript
// src/controllers/followController.js

import { db } from "../db/config.js";
import { followersTable, usersTable, profilesTable } from "../db/schema/index.js";
import { eq, and } from "drizzle-orm";
import { notifyUser } from "../utils/notificationHelper.js";

// FOLLOW USER
export const followUserController = async (req, res, next) => {
    try {
        const followerId = req.user.user_id;
        const { userId: followingId } = req.params;

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
            .from(followersTable)
            .where(and(
                eq(followersTable.follower_id, followerId),
                eq(followersTable.following_id, followingId)
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
            .insert(followersTable)
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
            data: newFollow
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};

// UNFOLLOW USER
export const unfollowUserController = async (req, res, next) => {
    try {
        const followerId = req.user.user_id;
        const { userId: followingId } = req.params;

        const [deletedFollow] = await db
            .delete(followersTable)
            .where(and(
                eq(followersTable.follower_id, followerId),
                eq(followersTable.following_id, followingId)
            ))
            .returning();

        if (!deletedFollow) {
            return res.status(404).json({
                success: false,
                message: "Follow relationship not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User unfollowed successfully!"
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

---

## 7️⃣ **Notification Helper (Complete)**

```javascript
// src/utils/notificationHelper.js

import { db } from "../db/config.js";
import { notificationsTable } from "../db/schema/Notifications.js";
import onlineUsersManager from "../socket/utils/onlineUsers.js";
import { emitToUser } from "../socket/utils/emitHelper.js";

// Save notification to database
const saveNotification = async (notificationData) => {
    try {
        const [notification] = await db
            .insert(notificationsTable)
            .values({
                user_id: notificationData.userId,
                actor_id: notificationData.senderId,
                type: notificationData.type,
                message: notificationData.content,
                post_id: notificationData.postId || null,
                comment_id: notificationData.commentId || null,
                is_read: false,
            })
            .returning();

        console.log('✅ Notification saved:', notification.notification_id);
        return notification;

    } catch (error) {
        console.error('❌ Error saving notification:', error);
        throw error;
    }
};

// Notify single user
const notifyUser = async (data) => {
    const { userId, senderId, type, content, postId, commentId, sender } = data;

    // Don't notify yourself
    if (userId === senderId) {
        console.log('⚠️ Skipping self-notification');
        return null;
    }

    try {
        // 1. Save to database
        const notification = await saveNotification({
            userId,
            senderId,
            type,
            content,
            postId,
            commentId
        });

        // 2. Check if user is online
        const isOnline = onlineUsersManager.isUserOnline(userId);

        console.log(`User ${userId} is ${isOnline ? 'online ✅' : 'offline ❌'}`);

        if (isOnline) {
            // 3. Send real-time notification
            const success = emitToUser(userId, 'new-notification', {
                ...notification,
                sender
            });

            if (success) {
                console.log(`🔔 Real-time notification sent to ${userId}`);
            }
        } else {
            console.log(`💾 User ${userId} offline, saved in DB only`);
        }

        return notification;

    } catch (err) {
        console.error('❌ Error in notifyUser:', err);
        throw err;
    }
};

// Notify followers about new post
const notifyFollowers = async (postData, followers) => {
    try {
        if (!followers || followers.length === 0) {
            console.log('⚠️ No followers to notify');
            return;
        }

        console.log(`📢 Notifying ${followers.length} followers...`);

        const promises = followers.map(async (follower) => {
            // Skip self
            if (follower.follower_id === postData.user_id) {
                return null;
            }

            try {
                const notification = await saveNotification({
                    userId: follower.follower_id,
                    senderId: postData.user_id,
                    type: 'new_post',
                    content: `${postData.user.name} created a new post`,
                    postId: postData.post_id
                });

                // Check if online
                const isOnline = onlineUsersManager.isUserOnline(follower.follower_id);

                if (isOnline) {
                    emitToUser(follower.follower_id, 'new-notification', {
                        ...notification,
                        sender: postData.user,
                        post: {
                            post_id: postData.post_id,
                            content: postData.content,
                            media_url: postData.media_url
                        }
                    });
                }

                return notification;

            } catch (error) {
                console.error(`❌ Error notifying follower ${follower.follower_id}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const successCount = results.filter(r => r !== null).length;

        console.log(`✅ Notified ${successCount}/${followers.length} followers`);

    } catch (error) {
        console.error('❌ Error in notifyFollowers:', error);
        throw error;
    }
};

export { saveNotification, notifyUser, notifyFollowers };
```

---

## 8️⃣ **Emit Helper**

```javascript
// src/socket/utils/emitHelper.js

import socketIO from "../index.js";
import onlineUsersManager from "./onlineUsers.js";

// Emit to specific user
export const emitToUser = (userId, eventName, data) => {
    try {
        const io = socketIO.getIO();
        const socketId = onlineUsersManager.getSocketId(userId);

        if (socketId) {
            io.to(socketId).emit(eventName, data);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error emitting to user ${userId}:`, error);
        return false;
    }
};

// Emit to multiple users
export const emitToUsers = (userIds, eventName, data) => {
    try {
        const io = socketIO.getIO();
        let sentCount = 0;

        userIds.forEach(userId => {
            const socketId = onlineUsersManager.getSocketId(userId);
            if (socketId) {
                io.to(socketId).emit(eventName, data);
                sentCount++;
            }
        });

        return sentCount;

    } catch (error) {
        console.error('Error emitting to users:', error);
        return 0;
    }
};
```

---

## 9️⃣ **Auth Middleware**

```javascript
// src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        req.user = {
            user_id: decoded.userId,
            email: decoded.email
        };

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
```

---

## 🔟 **Post Controller (With Notification)**

```javascript
// src/controllers/postController.js

import { db } from "../db/config.js";
import { postsTable, usersTable, profilesTable, followersTable } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { notifyFollowers } from "../utils/notificationHelper.js";

// CREATE POST
export const createPostController = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { content } = req.body;
        const file = req.file;

        let mediaUrl = null;
        let mediaType = null;

        if (file) {
            mediaUrl = req.file.path;
            mediaType = req.file.mimetype.split("/")[0];
        }

        // Get user
        const [user] = await db
            .select({
                user_id: usersTable.user_id,
                username: usersTable.username,
                name: usersTable.name,
            })
            .from(usersTable)
            .where(eq(usersTable.user_id, userId))
            .limit(1);

        // Get profile
        const [userProfile] = await db
            .select({ avatar: profilesTable.avatar })
            .from(profilesTable)
            .where(eq(profilesTable.user_id, userId))
            .limit(1);

        // Create post
        const [newPost] = await db
            .insert(postsTable)
            .values({
                user_id: userId,
                content,
                media_url: mediaUrl,
                media_type: mediaType,
            })
            .returning();

        // ✅ Get followers
        const followers = await db
            .select({ follower_id: followersTable.follower_id })
            .from(followersTable)
            .where(eq(followersTable.following_id, userId));

        console.log(`📢 Found ${followers.length} followers to notify`);

        // ✅ Notify followers (background)
        if (followers.length > 0) {
            const postDataForNotification = {
                ...newPost,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    username: user.username,
                    avatar: userProfile?.avatar
                }
            };

            notifyFollowers(postDataForNotification, followers).catch(err => {
                console.error('Error notifying followers:', err);
            });
        }

        res.status(201).json({
            success: true,
            message: "Post created successfully!",
            data: {
                ...newPost,
                user: {
                    name: user.name,
                    username: user.username,
                    avatar: userProfile?.avatar
                }
            }
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
```

---

## 📊 **API Endpoints Summary**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get all notifications | ✅ |
| `GET` | `/api/notifications/unread-count` | Get unread count | ✅ |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✅ |
| `PATCH` | `/api/notifications/mark-all-read` | Mark all as read | ✅ |
| `DELETE` | `/api/notifications/:id` | Delete notification | ✅ |
| `POST` | `/api/likes/:postId` | Like post (sends notification) | ✅ |
| `DELETE` | `/api/likes/:postId` | Unlike post | ✅ |
| `POST` | `/api/comments/:postId` | Comment (sends notification) | ✅ |
| `POST` | `/api/follow/:userId` | Follow user (sends notification) | ✅ |
| `DELETE` | `/api/follow/:userId` | Unfollow user | ✅ |
| `POST` | `/api/posts` | Create post (notifies followers) | ✅ |

---

## 🧪 **Testing with Postman**

### **1. Get Notifications**
```
GET http://localhost:5510/api/notifications
Headers: 
  Authorization: Bearer YOUR_TOKEN
```

### **2. Like Post (Trigger Notification)**
```
POST http://localhost:5510/api/likes/POST_ID
Headers: 
  Authorization: Bearer YOUR_TOKEN
```

### **3. Mark as Read**
```
PATCH http://localhost:5510/api/notifications/NOTIFICATION_ID/read
Headers: 
  Authorization: Bearer YOUR_TOKEN
```

---

Bhai, ab tumhara **complete backend** ready hai! 🎉

**Features:**
- ✅ All notification CRUD APIs
- ✅ Real-time Socket.IO integration
- ✅ Like/Comment/Follow with notifications
- ✅ Auth middleware
- ✅ Error handling
- ✅ Clean code structure

Koi doubt ho toh batao! 🚀