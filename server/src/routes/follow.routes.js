import express from "express";
import { followUserController, unFollowUserController } from "../controllers/follow.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";



export const followRoutes = express.Router();



followRoutes.post("/:id/follow", authMiddleware, followUserController);
followRoutes.delete("/:id/unfollow", authMiddleware, unFollowUserController);