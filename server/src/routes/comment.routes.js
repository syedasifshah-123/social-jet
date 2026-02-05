import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { commentPostController, deleteCommentController, editCommentController, getPostCommentsController } from "../controllers/comment.controller.js";



export const commentRoutes = express.Router();


commentRoutes.get("/:postId/get-all", authMiddleware, getPostCommentsController);
commentRoutes.post("/:postId/post", authMiddleware, commentPostController);
commentRoutes.patch("/:commentId/edit", authMiddleware, editCommentController);
commentRoutes.delete("/:commentId/delete", authMiddleware, deleteCommentController);