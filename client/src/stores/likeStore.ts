import api from "@/config/axios";
import { showToast } from "@/utils/showToast";
import { create } from "zustand";



interface LikeState {

    isLoading: boolean;

    likePost: (id: string) => Promise<boolean>;
    unLikePost: (id: string) => Promise<boolean>

}



export const useLikeStore = create<LikeState>((set) => ({

    isLoading: false,

    likePost: async (id: string): Promise<boolean> => {

        set({ isLoading: true });

        try {

            const response = await api.post(`/likes/${id}/like`);
            const { success } = response.data;

            if (!success) {
                return false;
            }

            return success;

        } catch (err: any) {
            showToast({ type: 'error', message: err?.response?.data?.message || "Like failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    unLikePost: async (id: string): Promise<boolean> => {

        set({ isLoading: true });

        try {

            const response = await api.delete(`/likes/${id}/unlike`);
            const { success } = response.data;

            if (!success) {
                return false;
            }

            return success;

        } catch (err: any) {
            showToast({ type: 'error', message: err?.response?.data?.message || "Unlike failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

}));