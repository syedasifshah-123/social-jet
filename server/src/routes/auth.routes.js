import express from "express";
import {
    changePasswordController,
    refreshAccessTokenController,
    checkUsernameController,
    loginController,
    logoutController,
    meController,
    registerController,
    requestResetOtpController,
    resendOtpController,
    resetPasswordController,
    verifyOtpController,
    verifyResetOtpController,
    checkAuthController
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


export const authRoutes = express.Router();



authRoutes.get("/check-auth", authMiddleware, checkAuthController);

authRoutes.post("/check-username", checkUsernameController);
authRoutes.post("/refresh-token", refreshAccessTokenController);

authRoutes.get("/me", authMiddleware, meController);


authRoutes.post("/register", registerController);
authRoutes.post("/verify-otp", verifyOtpController);
authRoutes.post("/resend-otp", resendOtpController);


authRoutes.post("/reset-password/request", requestResetOtpController);
authRoutes.post("/reset-password/verify", verifyResetOtpController);
authRoutes.post("/reset-password/confirm", resetPasswordController);


authRoutes.post("/login", loginController);
authRoutes.post("/logout", authMiddleware, logoutController);


authRoutes.put("/change-password", authMiddleware, changePasswordController);