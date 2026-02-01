// THIRD PARTY
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import http from "node:http";



// USER DEFINED
import { globalErrorHandler } from "../src/middlewares/error.middleware.js";
import { globalRateLimiter } from "../src/utils/rateLimit.js";
import { authRoutes } from "./routes/auth.routes.js";
import { OauthRoutes } from "./routes/oauth.routes.js";
import "./passport/oauth.passport.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { postRoutes } from "./routes/post.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { followRoutes } from "./routes/follow.routes.js";
import { connectPeopleRoutes } from "./routes/connectPeople.routes.js";
import { likeRoutes } from "./routes/like.routes.js";
import { bookMarkRoutes } from "./routes/bookmark.routes.js";
import { initSocketServer } from "./socket/index.js";
import { notificationRoutes } from "./routes/notification.routes.js";


// EXPRESS SERVER
const app = express();


// HTTP SERVER
export const server = http.createServer(app);


// INITIALIZE SOCKET SERVER
initSocketServer(server);


// COOKIE PARSING
app.use(cookieParser());


// INCOMING DATA PARSING MIDDLWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// CORS CONFIGURATION
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));




// GLOBAL RATE LIMTER
app.use(globalRateLimiter);



// PASSPORT INITIALIZATION
app.use(passport.initialize());


// AUTH ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/auth", OauthRoutes);


// PROFILE ROUTES
app.use("/api/profile", profileRoutes);

// POST ROUTE
app.use("/api/posts", postRoutes);

// USER ROUTE
app.use("/api/user", userRoutes);

// FOLLOWS ROUTE
app.use("/api/follows", followRoutes);

// CONNECT WITH TOP PEOPLES
app.use("/api/peoples", connectPeopleRoutes);

// LIKE ROUTES
app.use("/api/likes", likeRoutes);

// BOOKMARK ROUTES
app.use("/api/bookmarks", bookMarkRoutes);

// NOTIFICATION  ROUTES
app.use("/api/notifications", notificationRoutes);



// GLOBAL ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);