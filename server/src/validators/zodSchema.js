// USERS SCHEMA
import { z } from "zod";


// REGISTER SCHEMA
export const registerSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .min(3, { message: "Name should be at least 3 characters long" })
        .max(50, { message: "Name should be maximum 50 characters" }),
    email: z
        .email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(255, { message: "Password must be maximum 255 characters" }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(100, { message: "Username must be maximum 100 characters" }),
});


// LOGIN SCHEMA
export const loginSchema = z.object({
    email: z
        .email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(20, { message: "Password must be maximum 20 characters" })
});



// CHANGE PASSWORD SCHEMA
export const changePasswordSchema = z.object({
    oldPassword: z.string()
        .min(1, { message: "Old password is required" })
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(20, { message: "Password must be maximum 20 characters" }),
    newPassword: z.string()
        .min(1, { message: "New password is required" })
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(20, { message: "Password must be maximum 20 characters" })
});




// PROFILE SCHEMA
export const profileSchema = z.object({
    // REQUIRES
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(20, "Name must be at most 20 characters")
        .optional(),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can contain letters, numbers, and underscores only")
        .optional(),

    // Optional profile fields
    avatar: z
        .url("Avatar must be a valid URL")
        .max(500, "Avatar URL is too long")
        .optional(),

    banner_img: z
        .url("Banner image must be a valid URL")
        .max(500, "Banner image URL is too long")
        .optional(),

    bio: z
        .string()
        .trim()
        .min(0)
        .max(120, "Bio must be at most ~1.5 lines (max 120 characters)")
        .optional(),

    gender: z
        .enum(["male", "female", "other"])
        .optional(),

    location: z
        .string()
        .trim()
        .optional(),

    country: z
        .string()
        .trim()
        .optional(),

    birthdate: z
        .coerce
        .date()
        .refine((d) => d <= new Date(), "Birthdate cannot be in the future")
        .optional(),
});




// POSTS SHCEMA
export const postsTableSchema = z.object({
    post_id: z.uuid(),
    user_id: z.uuid(),
    content: z.string().min(1),
    media_url: z.url().optional(),
    media_type: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
});



// COMMENTS SCHEMA
export const commentsTableSchema = z.object({
    comment_id: z.uuid(),
    post_id: z.uuid(),
    user_id: z.uuid(),
    content: z.string().min(1),
    created_at: z.date(),
    updated_at: z.date(),
});



// LIKES SCHEMA
export const likesTableSchema = z.object({
    like_id: z.uuid(),
    user_id: z.uuid(),
    post_id: z.uuid(),
    created_at: z.date(),
});



// OTP SCHEMA
export const otpsTableSchema = z.object({
    otp_id: z.uuid(),
    user_id: z.uuid(),
    otp_type: z.enum(["verify", "reset"]),
    created_at: z.date(),
});



// MESSAGE SCHEMA
export const messagesTableSchema = z.object({
    message_id: z.uuid(),
    sender_id: z.uuid(),
    receiver_id: z.uuid(),
    message: z.string().min(1),
    is_read: z.boolean().default(false),
    created_at: z.date(),
});



// FOLLOWS SCHEMA
export const followsTableSchema = z.object({
    follow_id: z.uuid(),
    follower_id: z.uuid(),
    following_id: z.uuid(),
    created_at: z.date(),
});



// NOTIFICATIONS SCHEMA
export const notificationsTableSchema = z.object({
    notification_id: z.uuid(),
    user_id: z.uuid(),
    actor_id: z.uuid(),
    type: z.enum(["comment", "like", "follow", "message"]),
    message: z.string().optional(),
    reference_id: z.uuid().optional(),
    is_read: z.boolean().default(false),
    created_at: z.date(),
});