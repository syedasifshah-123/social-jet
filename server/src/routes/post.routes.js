import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createPostController, getPostDetailController, editPostController, deletePostController, getAllForYouPostsController, getAllFollowingPostsController } from "../controllers/post.controller.js";
import { upload } from "../config/multer.js";


export const postRoutes = express.Router();



postRoutes.get("/foryou/get", authMiddleware, getAllForYouPostsController);
postRoutes.get("/following/get", authMiddleware, getAllFollowingPostsController);
postRoutes.get("/:id/detail", getPostDetailController);
postRoutes.post("/create", authMiddleware, upload.single("media"), createPostController);
postRoutes.put("/:id/edit", authMiddleware, upload.single("media"), editPostController);
postRoutes.delete("/:id/delete", authMiddleware, deletePostController);