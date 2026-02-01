class OnlineUsersManager {

    constructor() {
        this.users = new Map();
    }


    // ADD USERS
    addUser(userId, socketId) {
        this.users.set(userId.toString(), socketId);
    }


    // REMOVE USER
    removeUser(socketId) {
        for (let [userId, sId] of this.users.entries()) {
            if (sId == socketId) {
                this.users.delete(userId);
                console.log(`❌ User ${userId} removed`);
                break;
            }
        }
    }


    // GET USER
    getSocketId(userId) {
        return this.users.get(userId.toString());
    }


    // CHECK USERS IS ONLINE OR NOT
    isUserOnline(userId) {
        return this.users.has(userId.toString());
    }


    // HOW MUCH USERS ARE ONLINE
    getOnlineUsersCount() {
        return this.users.size;
    }

}


const onlineUsersManager = new OnlineUsersManager();

export { onlineUsersManager }