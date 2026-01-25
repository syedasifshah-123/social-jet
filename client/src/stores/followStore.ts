import { create } from "zustand";
import api from "@/config/axios";
import { showToast } from "@/utils/showToast";

interface FollowState {

    isLoading: boolean;

    followUser: (userId: string) => Promise<boolean>;
    unFollowUser: (userId: string) => Promise<boolean>;

}

export const useFollowStore = create<FollowState>((set) => ({

    isLoading: false,


    // follow user action
    followUser: async (userId) => {
        set({ isLoading: true });

        try {
            const response = await api.post(`/follows/${userId}/follow`);
            const { success, message } = response.data;

            if (success) {
                showToast({ type: 'success', message });
                return true;
            }

            return false;
        } catch (error: any) {

            showToast({ type: 'error', message: error.response?.data?.message || "Follow failed" });
            return false;

        } finally {
            set({ isLoading: false });
        }
    },

    

    // unfollow user action
    unFollowUser: async (userId) => {
        set({ isLoading: true });
        try {
            const res = await api.delete(`follows/${userId}/unfollow`);
            if (res.data.success) {
                showToast({ type: 'success', message: res.data.message });
                return true;
            }
            return false;
        } catch (error: any) {
            showToast({ type: 'error', message: error.response?.data?.message || "Unfollow failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    }

}));
