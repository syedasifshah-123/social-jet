import { getIO } from "../index.js";
import { onlineUsersManager } from "./onlineUsers.js";


// EMIT MESSAGE 
const emitToUser = (userId, eventName, data) => {

    // get io from socket server
    const io = getIO();


    // get socket id from onlineusers class
    const socketId = onlineUsersManager.getSocketId(userId);

    if (socketId) {
        io.to(socketId).emit(eventName, data);
        console.log(`✅ Sent to user ${userId}`);
        return true;
    } else {
        console.log(`❌ User ${userId} offline`);
        return false;
    }

}


// SEND NOTIFICATOINS
const sendNotification = (userId, notification) => {
    return emitToUser(userId, "new-notification", notification);
}



export { emitToUser, sendNotification };