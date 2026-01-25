import express from "express";
import passport from "passport";
import { OAuthSuccess } from "../controllers/oauth.controller.js";


export const OauthRoutes = express.Router();



// GOOGLE ROUTES
OauthRoutes.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
);


OauthRoutes.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    OAuthSuccess
);