import { db } from "../db/config.js";
import { notificationsTable } from "../db/schema/Notifications.js";
import { sendNotification } from "../socket/utils/emitHelper.js";
import { onlineUsersManager } from "../socket/utils/onlineUsers.js";




// SAVE NOTIFICATIONS IN  DB
const saveNotification = async (notificationData) => {

    const { userId, senderId, type, content, postId } = notificationData;


    // CANNOT SHARE ITSELF
    if (userId === senderId) return;


    try {

        const [notification] = await db.insert(notificationsTable).values({
            user_id: userId,
            actor_id: senderId,
            type: type,
            message: content,
            post_id: postId || null,
        }).returning();


        return notification;

    } catch (err) {
        console.log(err);
        throw new Error(err);
    }

}




// SEND NOTIFICATION
const notifyUser = async (data) => {

    const { userId, senderId, type, content, postId, sender } = data;


    // Cannot notify yourself
    if (userId === senderId) {
        console.log('Cannot send notification to yourself');
        return null;
    }


    try {

        // SAVE TO DB
        const notification = await saveNotification({
            userId,
            senderId,
            type,
            content,
            postId,
        });


        // CHECK IF USER IS ONLINE OR NOT
        const isOnline = onlineUsersManager.isUserOnline(userId);


        // IF USER IS ONLINE THEN SEND REAL TIME 
        if (isOnline) {

            sendNotification(userId, {
                ...notification,
                sender: {
                    user_id: sender.user_id,
                    name: sender.name,
                    username: sender.username,
                    avatar: sender.avatar
                }
            });


        }


        return notification;

    } catch (err) {
        console.error('Error in notifyUser:', err);
        throw err;
    }

}




// NOTIFY FOLLOWERS
const notifyFollowers = async (postData, followers) => {
    try {


        // If no followers
        if (!followers || followers.length === 0) {
            console.log('⚠️ No followers to notify');
            return;
        }


        const notificationPromises = followers.map(async (follower) => {

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
                    // Send real-time
                    sendNotification(follower.follower_id, {
                        ...notification,
                        sender: {
                            user_id: postData.user_id,
                            name: postData.user.name,
                            username: postData.user.username,
                            avatar: postData.user.avatar
                        },
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


        const results = await Promise.all(notificationPromises);
        const successCount = results.filter(r => r !== null).length;

        console.log(`✅ Successfully notified ${successCount}/${followers.length} followers`);

    } catch (err) {
        console.log(err);
        throw err;
    }
}



export { saveNotification, notifyUser, notifyFollowers };