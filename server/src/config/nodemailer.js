import nodemailer from "nodemailer";
import "dotenv/config"
import { ENV } from "./env.js";

const transporter = nodemailer.createTransport({
    host: ENV.SMTP_USER,
    port: 465,
    secure: true,
    auth: {
        user: ENV.SENDER_EMAIL,
        pass: ENV.SMTP_PASS
    }
});


export default transporter;