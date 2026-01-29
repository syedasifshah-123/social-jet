import api from "@/config/axios";
import { ApiErrorResponse, UserType } from "@/types/authTypes";
import { ProfileDataType } from "@/types/profileTypes";
import { showToast } from "@/utils/showToast";
import { AxiosError } from "axios";
import { create } from "zustand";


interface ProfileState {

    isLoading: boolean;
    userData: [],
    users: UserType[],
    userProfile: any;

    getUserProfile: (username: string) => Promise<void>;
    getAllUsers: () => Promise<void>
    createProfile: (profileData: FormData) => Promise<boolean>;
    updateProfile: (profileData: ProfileDataType) => void;

}



export const useProfileStore = create<ProfileState>((set, get) => ({

    isLoading: false,
    userData: [],
    users:[],
    userProfile: {},



    // GET USER PROFILE ACTION
    getUserProfile: async (username: string): Promise<void> => {
        
        set({ isLoading: true });

        try {

            const response = await api.get(`/user/${username}/get`);
            const { success, data } = response.data;

            if (success) {
                set({ userProfile: data });
            } else {
                return;
            }

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

        } finally {
            set({ isLoading: false })
        }
    },




    // GET ALL USER ACTION
    getAllUsers: async (): Promise<void> => {

        set({ isLoading: true });

        try {
            
            const response = await api.get("/user/all");
            const { success, data } = response.data;

            if (success) {
                set({ users: data });
            }

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

        } finally {
            set({ isLoading: false });
        }
    },



    // CREATE PROFILE ACTION
    createProfile: async (profileData: FormData): Promise<boolean> => {
        set({ isLoading: true });
        try {
            const response = await api.put("/profile/update", profileData);
            const { success, message } = response.data;
            if (!success) return false;
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



    // UPDATE PROFILE ACTION
    updateProfile: async (profileData: ProfileDataType) => {
        set({ isLoading: true });
    }

}));