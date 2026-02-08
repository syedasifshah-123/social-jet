import { changePasswordSchema, loginSchema, registerSchema } from "../validators/zodSchema.js";
import { db } from "../db/config.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateOtp } from "../utils/otp.js";
import { sendEmail } from "../emails/emailHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";


// SCHEMAS
import { usersTable } from "../db/schema/Users.js";
import { otpsTable } from "../db/schema/Otps.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { deleteCache, getCache, setCache } from "../utils/cacheHelper.js";





// CHECK AUTH CONTROLLER
const checkAuthController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;


        // FETCH USER
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.user_id, userId),
            columns: {
                user_id: true,
                name: true,
                email: true,
                username: true
            }
        });


        // FIND USER PROFILE
        const userProfile = await db.query.profilesTable.findFirst({
            where: eq(profilesTable.user_id, userId),
            columns: {
                profile_id: true,
                avatar: true,
                banner_img: true
            }
        });


        // NEEDED DATA
        const userData = {
            userId: user.user_id,
            name: user.name,
            email: user.email,
            username: user.username,
            avatar: userProfile.avatar,
            bannerImg: userProfile.banner_img
        }


        res.status(200).json(userData);

    } catch (err) {
        next(err);
    }
};




// CHECK USERNAME CONTROLLER
const checkUsernameController = async (req, res, next) => {
    try {

        const { username } = req.body;

        // basic validation
        if (!username || username.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Invalid username",
            });
        }

        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.username, username.toLowerCase()),
        });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                exists: true,
                message: "Username is already taken",
            });
        }

        return res.status(200).json({
            success: true,
            exists: false,
            message: "Username is available",
        });

    } catch (err) {
        console.error("CHECK USERNAME ERROR:", err);
        next(err);
    }
};






// REFRESH ACCESS TOKEN CONTROLLER
const refreshAccessTokenController = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // New access token generate karo
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        next(err);
    }
};





// GET CURRENT USER
const meController = async (req, res, next) => {
    try {

        const { id: userId } = req.user;

        // CHECK USER IN DB
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.user_id, userId),
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


        return res.status(200).json({
            success: true,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                username: user.username,
            },
        });

    } catch (err) {
        next(err);
    }
};




// USER REGISTER CONTROLLER
const registerController = async (req, res, next) => {
    try {


        // VALIDATE INPUT
        const parsedSchema = registerSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) next(error);


        // DESTRUCTURING DATA
        const { name, email, password, username } = data;


        // CHECK IF USER EXISTS
        const user = await db.query.usersTable.findFirst({
            where: or(eq(usersTable.email, email), eq(usersTable.username, username))
        });


        if (user) {
            if (user.email === email) {
                throw new Error("User already exists with this email!");
            }
            if (user.username === username) {
                throw new Error("Username must be unique!");
            }
        }


        // HASHING PASSWORD + GENERATING OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();


        // SENDING OTP EMAIL
        await sendEmail("verifyOtp", email, name, { otp });

        let newUser;

        // TRANSACTION: INSERT -> USER, OTP, PROFILE 
        await db.transaction(async (tx) => {

            [newUser] = await tx.insert(usersTable).values({
                name,
                email,
                password: hashedPassword,
                username,
                isVerified: false
            }).returning();

            // OTP stored in redis cache
            const otpCacheKey = `otp:verify:${newUser.user_id}`;
            await setCache(otpCacheKey, otp, 300); // 5min


            await tx.insert(profilesTable).values({
                user_id: newUser.user_id,
            }).returning();

        });

        // GENERATE TOKENS 
        const accessToken = generateAccessToken({ id: newUser.user_id });
        const refreshToken = generateRefreshToken({ id: newUser.user_id });


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            accessToken,
            user: {
                userId: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username
            }
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// VERIFY OTP CONTROLLER
const verifyOtpController = async (req, res, next) => {
    try {

        const { email, otp } = req.body;

        // FIND USER BY THIS EMAIL
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email),
        });


        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }


        // get otp from redis cache
        const cachedOtp = await getCache(`otp:verify:${user.user_id}`);

        if (!cachedOtp || cachedOtp !== otp) {
            throw new Error("Otp Invalid or expired!");
        }


        // UPDATE USER VERIFIED
        await db.update(usersTable)
            .set({ isVerified: true })
            .where(eq(usersTable.user_id, user.user_id));


        await deleteCache(`otp:verify:${user.user_id}`);
        
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully!"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }

};





// RESEND OTP CONTROLLER
const resendOtpController = async (req, res, next) => {
    try {

        const { email } = req.body;


        // FIND USER
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email),
        });


        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }


        // GENERATE NEW OTP
        const otp = generateOtp();


        // set cahce in redis 
        const cacheKey = `otp:verify:${user.user_id}`;
        await setCache(cacheKey, otp, 300);


        // SEND EMAIL
        await sendEmail("verifyOtp", email, user.name, { otp });


        // SUCCESS RESPONSE
        return res.status(200).json({
            success: true,
            message: "New OTP sent successfully!",
        });

    } catch (err) {
        next(err);
    }
};





// LOGIN CONTROLLER
const loginController = async (req, res, next) => {
    try {

        // VALIDATE INPUT
        const parsedSchema = loginSchema.safeParse(req.body);
        const { success, data, error } = parsedSchema;
        if (!success) next(error);


        // DESTRUCTURING DATA
        const { email, password } = data;


        // CHECK IF USER EXISTS
        const user = await db.query.usersTable.findFirst({
            where: or(eq(usersTable.email, email))
        });


        if (!user) { return res.status(400).json({ success: false, message: "Invalid credentials" }); }


        // CHECK IF USER VERIFIED
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your account first"
            });
        }


        // COMPARE PASSWORD
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        // GENERATE ACCESS + REFRESH TOKEN
        const accessToken = generateAccessToken({ id: user.user_id });
        const refreshToken = generateRefreshToken({ id: user.user_id });


        // SAVE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        // SUCCESS RESPONSE
        return res.status(201).json({
            success: true,
            message: "Login successful!",
            accessToken,
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// REQUEST RESET PASSWORD OTP CONTROLLER
const requestResetOtpController = async (req, res, next) => {
    try {

        const { email } = req.body;

        // CHECK USER IN DB
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email),
        });

        if (!user) { return res.status(400).json({ success: false, message: "User not found" }); }


        // GENERATE OTP + SAVE IN REDIS
        const otp = generateOtp();

        const cacheKey = `otp:reset:${user.user_id}`;
        await setCache(cacheKey, otp, 300); // 5min


        // SEND EMAIL
        await sendEmail("resetOtp", email, user.name, { otp });


        // SUCCESS RESOPNSE
        return res.status(200).json({ success: true, message: "Reset OTP sent to email" });

    } catch (err) {
        console.log(err);
        next(err);
    }
}





// VERIFY RESET PASSWORD OTO CONTROLLER
const verifyResetOtpController = async (req, res, next) => {
    try {

        const { email, otp } = req.body;


        // CHECK USER
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email)
        });


        if (!user) return res.status(400).json({ success: false, message: "User not found" });


        // CHECK OTP FROM REDIS
        const cachedOtp = await getCache(`otp:reset:${user.user_id}`);

        if (!cachedOtp || cachedOtp !== otp) {
            return res.status(400).json({ success: false, message: "OTP invalid or expired" });
        }

        // OTP verified → allow password reset
        return res.status(200).json({ success: true, message: "OTP verified, you can reset password now" });

    } catch (err) {
        next(err);
    }
};





// RESET PASSWORD CONTROLLER
const resetPasswordController = async (req, res, next) => {
    try {

        const { email, newPassword } = req.body;


        // CHECK USER IN DB
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.email, email),
        });

        if (!user) return res.status(400).json({ success: false, message: "User not found" });


        // HASHED PASSWORD
        const hashedPassword = await bcrypt.hash(newPassword, 10);


        // UPDATE THE PASSWORD
        await db.update(usersTable)
            .set({ password: hashedPassword })
            .where(eq(usersTable.user_id, user.user_id));


        // SEND EMAIL
        await sendEmail("passwordUpdate", email, user.name, {});

        // DELETE OTP FROM REDIS
        await deleteCache(`otp:reset:${user.user_id}`);

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (err) {
        next(err);
    }
};





// LOGOUT CONTROLLER
const logoutController = async (req, res, next) => {
    try {


        const { user_id: userId } = req.user;


        // delete user cache from redis
        await deleteCache(`user:${userId}`);

        // CLEAR COOKIE
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (err) {
        next(err);
    }
};





// CHANGE PASSWORD CONTROLLER
const changePasswordController = async (req, res, next) => {
    try {

        const { id: userId } = req.user;
        const parsedSchema = changePasswordSchema.safeParse(req.body);
        const { data, success, error } = parsedSchema;

        if (!success) next(error);

        const { oldPassword, newPassword } = data;


        // FIND USER WITH ID
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.user_id, userId),
        });


        // IF USER NOT FOUND
        if (!user) { return res.status(404).json({ success: false, message: "User not found" }); }


        // COMPARE PASSWORD
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db.update(usersTable).set({ password: hashedNewPassword }).where(eq(usersTable.user_id, userId));

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
}







export {
    checkAuthController,
    refreshAccessTokenController,
    checkUsernameController,
    meController,
    registerController,
    verifyOtpController,
    resendOtpController,
    requestResetOtpController,
    verifyResetOtpController,
    resetPasswordController,
    loginController,
    logoutController,
    changePasswordController
}