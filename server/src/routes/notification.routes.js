import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { deleteNotificationController, getAllNotificationsController, markAllAsReadController, markAsReadController } from "../controllers/notification.controller.js";



export const notificationRoutes = express.Router();


notificationRoutes.get("/all", authMiddleware, getAllNotificationsController);
notificationRoutes.patch("/:notificationId/read", authMiddleware, markAsReadController);
notificationRoutes.patch("/mark-all-read", authMiddleware, markAllAsReadController);
notificationRoutes.delete("/:notificationId/delete", authMiddleware, deleteNotificationController);