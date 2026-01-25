import { ZodError } from "zod";

export const extractZodErrors = (error) => {

    if (!(error instanceof ZodError)) return null;

    const errors = error.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join(".") : "unknown",
        message: issue.message,
        code: issue.code,
    }));

    return {
        statusCode: 400,
        message: errors[0]?.message || "Validation failed",
        errors,
    };

};