import api from "@/config/axios";
import { ApiErrorResponse } from "@/types/authTypes";
import { showToast } from "@/utils/showToast";
import { AxiosError } from "axios";
import { create } from "zustand";



type Post = {
    content?: string;
    media?: string;
}


type PostState = {

    isLoading: boolean;
    isPostLoading: boolean;

    forYouPosts: Post[];
    followingPosts: Post[]

    forYouHasMore: boolean;
    forYouPage: number;
    followingHasMore: boolean;
    followingPage: number;

    getAllForYouPosts: () => Promise<void>;
    getAllFollowingPosts: () => Promise<void>;
    createPost: (postData: FormData) => Promise<boolean>;
    addPostToTop: (formData: FormData) => void;
    resetForYou: () => void;
    resetFollowing: () => void;

}


export const usePostStore = create<PostState>((set, get) => ({

    isLoading: false,
    isPostLoading: false,
    forYouPosts: [],
    followingPosts: [],

    followingHasMore: true,
    followingPage: 1,
    forYouHasMore: true,
    forYouPage: 1,



    // GET ALL FOR YOU POSTS
    getAllForYouPosts: async (): Promise<void> => {

        const { forYouPage, forYouPosts, isPostLoading, forYouHasMore } = get();
        if (isPostLoading || !forYouHasMore) return;
        set({ isPostLoading: true });

        try {

            const response = await api.get(`/posts/foryou/get?page=${forYouPage}&limit=6`);
            const { success, data, nextPage } = response?.data || [];

            if (success) {
                set({
                    forYouPosts: forYouPage === 1 ? data : [...forYouPosts, ...data],
                    forYouPage: nextPage ? nextPage : forYouPage,
                    forYouHasMore: nextPage !== null,
                });
            }

        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

        } finally {
            set({ isPostLoading: false });
        }

    },




    // get all following posts
    getAllFollowingPosts: async (): Promise<void> => {

        const { followingPage, followingPosts, isPostLoading, followingHasMore } = get();
        if (isPostLoading || !followingHasMore) return;
        set({ isPostLoading: true });

        try {

            const response = await api.get(`/posts/following/get?page=${followingPage}&limit=6`);
            const { success, data, nextPage } = response?.data || [];

            if (success) {
                set({
                    followingPosts: followingPage === 1 ? data : [...followingPosts, ...data],
                    followingPage: nextPage ? nextPage : followingPage,
                    followingHasMore: nextPage !== null,
                });
            }


        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });

        } finally {
            set({ isPostLoading: false });
        }

    },




    // CREATE POST ACTION
    createPost: async (postData: FormData): Promise<boolean> => {
        set({ isLoading: true });

        try {

            const response = await api.post("/posts/create", postData);
            const { success, message, data } = response.data;

            if (success) {
                showToast({ type: "success", message });
                get().addPostToTop(data);
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



    // RESET FOLLOWING POST
    resetFollowing: () => {
        set({
            followingPosts: [],
            followingPage: 1,
            followingHasMore: true,
            isPostLoading: false // Ensure loading is reset
        });
    },



    // RESET FOR YOUT ACTION
    resetForYou: () => {
        set({
            forYouPosts: [],
            forYouPage: 1,
            forYouHasMore: true,
            isPostLoading: false // Ensure loading is reset
        });
    },


    // ADD POST TO TOP TEMPORARY FOR THE CURRENT USER
    addPostToTop: (newPost: FormData) => {
        set((state: any) => ({
            forYouPosts: [newPost, ...state.forYouPosts]
        }));
    }

}));