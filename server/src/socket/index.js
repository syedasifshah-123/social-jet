import { Server } from "socket.io";
import { connectionHandler } from "./handlers/connectionHandler.js";



// SOCKET IO INSTANCE
let io;



// INITIALIZING SOCKET SERVERA
const initSocketServer = (server) => {

    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });



    // IF USERS ARE CONNECTED IN SOCKET
    io.on("connection", (socket) => {
        console.log('New user connected:', socket.id);


        // users online offline connection handler
        connectionHandler(socket, io);

        socket.on("disconnect", () => {
            console.log('User disconnected:', socket.id);
        });
    });


    return io;
}



// GET IO
const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized!');

    return io;
}




export { initSocketServer, getIO }