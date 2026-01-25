import { Resend } from "resend";
import { ENV } from "./env.js";


export const resendClient = new Resend(ENV.RESEND_API_KEY);


export const sender = {
    name: ENV.EMAIL_SENDER_NAME,
    email: ENV.EMAIL_SENDER_EMAIL
}