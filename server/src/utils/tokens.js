import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";


// ACCESS TOKEN
const generateAccessToken = (payload) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d" // todo changine it to 15m
    });
}




// REFRESH TOKEN
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });
}




// VERIFY ACCESS TOKEN
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
}




// VERIFY ACCESS TOKEN
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
}




// GENERATE TOKENS AND SET COOKIES
const generateTokensAndSetCookies = (res, payload) => {

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

}




export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokensAndSetCookies
}