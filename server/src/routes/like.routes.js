import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { postLikeController, postUnLikeController } from "../controllers/like.controller.js";



export const likeRoutes = express.Router();



likeRoutes.post("/:postId/like", authMiddleware, postLikeController);
likeRoutes.delete("/:postId/unlike", authMiddleware, postUnLikeController);