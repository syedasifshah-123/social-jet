import { db } from "../db/config.js";
import { notificationsTable } from "../db/schema/Notifications.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { and, desc, eq, sql } from "drizzle-orm";




// GET ALL NOTIFICATIONS CONTROLLER
const getAllNotificationsController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;


        // get all notification from db for the user
        const notifications = await db.
            select({
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


        const unreadCount = formattedNotifications.filter(n => !n.is_read).length;


        res.status(200).json({
            success: true,
            data: {
                notifications: formattedNotifications,
                unreadCount
            }
        });

    } catch (err) {
        next(err);
    }
}




// NOTIFICATION MARK AS READ CONTROLLER
const markAsReadController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { notificationId } = req.params;


        const [updatedNotification] = await db
            .update(notificationsTable)
            .set({ is_read: true })
            .where(and(
                eq(notificationsTable.notification_id, notificationId),
                eq(notificationsTable.user_id, userId)
            )).returning();


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
        next(err);
    }
}




// NOTIFICATION MARK ALL AS READ CONTROLLER
const markAllAsReadController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;


        const [updatedNotification] = await db
            .update(notificationsTable)
            .set({ is_read: true })
            .where(eq(notificationsTable.user_id, userId)).returning();


        if (!updatedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "All Notifications are marked as read",
            data: updatedNotification
        });


    } catch (err) {
        next(err);
    }
}




// DELETE NOTIFICATION CONTROLLER
const deleteNotificationController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const { notificationId } = req.params;


        // delete notification
        const [deletedNotification] = await db
            .delete(notificationsTable)
            .where(and(
                eq(notificationsTable.notification_id, notificationId),
                eq(notificationsTable.user_id, userId),
            )).returning();


        if (!deletedNotification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted.",
        });


    } catch (err) {
        next(err);
    }
}




export { getAllNotificationsController, markAsReadController, markAllAsReadController, deleteNotificationController };