import express from "express";
import { getUserProfileController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


export const userRoutes = express.Router();


userRoutes.get("/:username/get", authMiddleware, getUserProfileController);