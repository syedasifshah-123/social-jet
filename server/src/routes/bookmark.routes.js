import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getBookmarkedPostsController, postSaveController, postUnSaveController } from "../controllers/bookmark.controller.js";



export const bookMarkRoutes = express.Router();



bookMarkRoutes.get("/saved", authMiddleware, getBookmarkedPostsController);
bookMarkRoutes.post("/:postId/save", authMiddleware, postSaveController);
bookMarkRoutes.delete("/:postId/unsave", authMiddleware, postUnSaveController);