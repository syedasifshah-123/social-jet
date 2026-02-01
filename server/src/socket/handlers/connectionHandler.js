import { onlineUsersManager } from "../utils/onlineUsers.js";

const connectionHandler = (socket, io) => {


    // IF USERS ARE ONLNE
    socket.on("user-online", (userId) => {
        console.log(`User ${userId} is online`);


        // add user in online users
        onlineUsersManager.addUser(userId, socket.id);

        socket.broadcast.emit("user-status", {
            userId,
            status: "online"
        });
    });


    // IF USERS ARE OFFLINE
    socket.on("disconnect", (userId) => { 
        console.log('User disconnected');

        // delete user from online users
        onlineUsersManager.removeUser(userId);
    });

}


export { connectionHandler }