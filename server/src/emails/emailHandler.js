// import { resendClient, sender } from "../config/resend.js";
import { createResetPasswordOtpEmailTemplate, createVerifyOtpEmailTemplate, createWelcomeEmailTemplate, passwordUpdatedEmailTemplate } from "./emailTemplates.js";
import transporter from "../config/nodemailer.js";


export const sendEmail = async (type, email, name, data) => {

    let html;
    let subject;

    switch (type) {

        case "welcome":
            subject = "Welcome to JET!";
            html = createWelcomeEmailTemplate(name);
            break;

        case "verifyOtp":
            subject = "Verify your JET account"
            html = createVerifyOtpEmailTemplate(name, data.otp);
            break;

        case "resetOtp":
            subject = "Reset your Chatify password";
            html = createResetPasswordOtpEmailTemplate(name, data.otp);
            break;

        case "passwordUpdate":
            subject = "Your JET password has been updated";
            html = passwordUpdatedEmailTemplate(name);
            break;


        default:
            throw new Error("Invalid email type");
    }

    try {

        const mailOptions = {
            from: `JET - ${name} <syedasifshah582@gmail.com>`,
            to: email,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);

        console.log("Mail send")

    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }

}