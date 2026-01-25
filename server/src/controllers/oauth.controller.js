import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import { ENV } from "../config/env.js";


export const OAuthSuccess = async (req, res) => {

    const { user_id } = req.user;

    const accessToken = generateAccessToken({ id: user_id });
    const refreshToken = generateRefreshToken({ id: user_id });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
        `${ENV.CLIENT_URL}/auth-success?token=${accessToken}`
    );

};