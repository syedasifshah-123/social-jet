import api from "@/config/axios";
import { showToast } from "@/utils/showToast";
import { create } from "zustand";



interface BookmarkState {

    isLoading: boolean;
    bookmarkPosts: [];

    savePost: (id: string) => Promise<boolean>;
    unSavePost: (id: string) => Promise<boolean>;
    getBookmarkedPosts: () => Promise<void>;

}



export const useBookmarkStore = create<BookmarkState>((set) => ({

    isLoading: false,
    bookmarkPosts: [],


    // POST SAVE ACTION
    savePost: async (id: string): Promise<boolean> => {

        set({ isLoading: true });

        try {

            const response = await api.post(`/bookmarks/${id}/save`);
            const { success } = response.data;

            if (!success) {
                return false;
            }

            return success;

        } catch (err: any) {
            showToast({ type: 'error', message: err?.response?.data?.message || "Bookmark failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },



    // POST UNSAVE ACTION
    unSavePost: async (id: string): Promise<boolean> => {

        set({ isLoading: true });

        try {

            const response = await api.delete(`/bookmarks/${id}/unsave`);
            const { success } = response.data;

            if (!success) {
                return false;
            }

            return success;

        } catch (err: any) {
            showToast({ type: 'error', message: err?.response?.data?.message || "Unbookmark failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },



    // get saved post action
    getBookmarkedPosts: async (): Promise<void> => {
        
        set({ isLoading: true });
        
        try {

            const response = await api.get("/bookmarks/saved-all");
            const { success, data } = response.data;

            if (success) {
                set({ bookmarkPosts: data });
            }

        } catch (err: any) {
            showToast({ type: 'error', message: err?.response?.data?.message || "Unbookmark failed" });
        } finally {
            set({ isLoading: false });
        }
    }


}));