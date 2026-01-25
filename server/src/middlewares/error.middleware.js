import { ZodError } from "zod";
import { extractZodErrors } from "../utils/zodError.js";

export const globalErrorHandler = (err, req, res, next) => {

    if (err instanceof ZodError) {
        const { statusCode, errors, message } = extractZodErrors(err);
        console.log(message)
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }

    const statusCode = err.statusCode || 500;
    const errMessage = err.message || "Server error";

    return res.status(statusCode).json({
        success: false,
        message: errMessage,
    });

};