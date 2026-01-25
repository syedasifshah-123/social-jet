import api from "@/config/axios";
import { ApiErrorResponse, ConfirmResetPasswordType, ForgotPassworFormType, ForgotPassworOtpFormType, LoginFormType, OtpVerificationFormType, SignupFormType } from "@/types/authTypes";
import { showToast } from "@/utils/showToast";
import { AxiosError } from "axios";
import { User } from "lucide-react";
import { create } from "zustand";


interface User {
    userId: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
}


interface AuthState {

    accessToken: string | null;
    user: User | null;
    isAuthenticated?: boolean;
    isLoading: boolean;
    isCheckingAuth: boolean;


    signup: (formData: SignupFormType) => Promise<boolean>;
    verifyOtp: (formData: OtpVerificationFormType) => Promise<boolean>;
    login: (formData: LoginFormType) => Promise<boolean>;
    logout: () => void;
    refreshAccessToken: () => Promise<boolean>;
    checkAuth: () => Promise<void>;
    forgotPassword: (formData: ForgotPassworFormType) => Promise<boolean>;
    verifyForgotPasswordOtp: (formData: ForgotPassworOtpFormType) => Promise<boolean>;
    confirmResetPassword: (formData: ConfirmResetPasswordType) => Promise<boolean>;

}


export const useAuthStore = create<AuthState>((set, get) => ({

    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true,


    checkAuth: async (): Promise<void> => {

        set({ isCheckingAuth: true });

        try {

            const token = localStorage.getItem("accessToken");

            if (!token) {
                set({ user: null, isAuthenticated: false });
                return;
            }

            const response = await api.get("/auth/check-auth", {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ user: response.data, isAuthenticated: true });

        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });
            // return false;

        } finally {
            set({ isCheckingAuth: false });
        }
    },


    // SIGNUP ACTION
    signup: async (signupFormData: SignupFormType): Promise<boolean> => {

        // API CALL LOGIC
        try {
            set({ isLoading: true });

            const response = await api.post("/auth/register", signupFormData);
            const { success, message, accessToken, user } = response.data;

            if (success) {

                set({ accessToken, user, isAuthenticated: true });
                localStorage.setItem("accessToken", accessToken);
                showToast({ type: 'success', message });

                return success;
            } else {
                showToast({ type: 'error', message });
                return false;
            }

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });
            return false;

        } finally {
            set({ isLoading: false });
        }
    },



    // VERIFY OTP ACTION
    verifyOtp: async (formData: OtpVerificationFormType): Promise<boolean> => {
        try {

            set({ isLoading: true });

            // API CALL LOGIC
            const response = await api.post("/auth/verify-otp", formData);
            const { success, message } = response.data;

            if (success) {
                showToast({ type: 'success', message });
            } else {
                showToast({ type: 'error', message });
            }

            return success;

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }
    },



    // REFRESH ACCESS TOKEN ACTION
    refreshAccessToken: async (): Promise<boolean> => {
        try {
            set({ isLoading: true });

            const response = await api.post("/auth/refresh-token", {}, {
                withCredentials: true
            });

            const { success, user } = response.data;
            set({ user, isAuthenticated: true });

            return success;

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }
    },


    // LOGIN ACTION
    login: async (formData: LoginFormType): Promise<boolean> => {
        set({ isLoading: true });

        try {

            const response = await api.post("/auth/login", formData);
            const { success, message, accessToken, user } = response.data;

            if (success) {

                set({ accessToken, user, isAuthenticated: true });
                localStorage.setItem("accessToken", accessToken);
                showToast({ type: "success", message });

            }

            return success;

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }

    },




    // FORGOT PASSWORD
    forgotPassword: async (formData: ForgotPassworFormType): Promise<boolean> => {

        set({ isLoading: true });

        try {

            const response = await api.post("/auth/reset-password/request", formData);
            const { success, message } = response.data;

            if (success) {
                showToast({ type: "success", message });
            } else {
                showToast({ type: "error", message });
            }

            return success;

        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }
    },



    // VERIFY FORGOT PASSWORD OTP
    verifyForgotPasswordOtp: async (formData: ForgotPassworOtpFormType): Promise<boolean> => {
        set({ isLoading: true });
        try {

            // API CALL LOGIC
            const response = await api.post("/auth/reset-password/verify", formData);
            const { success, message } = response.data;

            if (success) {
                showToast({ type: 'success', message });
            } else {
                showToast({ type: 'error', message });
            }

            return success;

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }
    },



    confirmResetPassword: async (formData: ConfirmResetPasswordType): Promise<boolean> => {
        set({ isLoading: true });

        try {

            const response = await api.post("/auth/reset-password/confirm", formData);
            const { success, message } = response.data;

            if (success)  {
                showToast({ type: "success", message });
            }

            return success;

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

            return false;
        } finally {
            set({ isLoading: false });
        }

    },


    // LOGOUT ACTION
    logout: async () => {
        set({ user: null, isAuthenticated: false });

        try {

            const response = await api.post("/auth/logout");
            const { success, message } = response.data;

            if (success) {
                localStorage.removeItem("accessToken");
                return showToast({ type: "success", message });
            } else {
                return showToast({ type: "error", message });
            }

        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });
        }

    }

}));