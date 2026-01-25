import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { updateProfileController } from "../controllers/profile.controller.js";
import { upload } from "../config/multer.js";


export const profileRoutes = express.Router();



profileRoutes.put("/update",
    authMiddleware,
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "banner_img", maxCount: 1 }
    ]),
    updateProfileController
);