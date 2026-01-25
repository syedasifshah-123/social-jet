import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";


const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        if (file.mimetype.startsWith("image/")) {

            return {
                folder: "JET/photos",
                resource_type: "image",
                allowedFormats: ["png", "jpg", "jpeg", "webp"],
                transformation: [{ width: 500, height: 500, crop: "limit" }],
            };
            
        } else if (file.mimetype.startsWith("video/")) {

            return {
                folder: "JET/videos",
                resource_type: "video",
                allowedFormats: ["mp4", "mov", "avi", "mkv"],
                transformation: [{ width: 640, height: 360, crop: "limit" }],
            };

        }
    },
});



export const upload = multer({ storage });