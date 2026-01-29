// Auth related types


// SIGNUP FORM TYPE
export interface SignupFormType {
    name: string;
    email: string;
    username: string
    password: string;
}




// LOGIN FORM TYPE
export interface LoginFormType {
    email: string;
    password: string;
}



// OTP VERIFICATION FORM TYPE
export interface OtpVerificationFormType {
    email: string | null;
    otp: string;
}



// FORGOT PASSWORD TYPE
export interface ForgotPassworFormType {
    email: string
}



// FORGOT PASS OTP TYPE
export interface ForgotPassworOtpFormType {
    email: string | null;
    otp: string;
}



// CONFIRM RESET PASSWORD TYPE
export interface ConfirmResetPasswordType {
    email: string | null;
    newPassword: string;
}



// ERROR TYPE
export interface ApiErrorResponse {
    message: string;
}



// all User type
export interface UserType {
    id: string;
    name: string;
    username: string;
    avatar: string;
}