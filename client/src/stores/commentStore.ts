import api from "@/config/axios";
import { showToast } from "@/utils/showToast";
import { create } from "zustand";
import { useAuthStore } from "./authStore";



interface Comment {
    id: string,
    content: string,
    user: {
        name: string,
        username: string,
        avatar: string | null
    }
}


interface CommentState {

    isLoading: boolean;
    isCommentPosting: boolean;
    comments: Comment[],
    commentsCount: number;

    getComments: (postId: string) => Promise<void>;
    postComment: (postId: string, content: string) => Promise<void>;
    addCommentToTop: (data: Comment) => void;
    editComment: (commentId: string, content: string) => Promise<void>;
    deleteComment: (commentId: string) => Promise<void>;

}




export const useCommentStore = create<CommentState>((set, get) => ({

    isLoading: false,
    isCommentPosting: false,
    comments: [],
    commentsCount: 0,


    // get comments action
    getComments: async (postId: string): Promise<void> => {

        set({ isLoading: true });

        try {

            const response = await api.get(`/comments/${postId}/get-all`);
            const { success, data, count } = response.data;

            if (success) {
                set({ comments: data, commentsCount: count });
            }


        } catch (err: unknown) {

        } finally {
            set({ isLoading: false });
        }
    },


    // post comment action
    postComment: async (postId: string, content: string): Promise<void> => {

        set({ isCommentPosting: true });

        try {

            const response = await api.post(`/comments/${postId}/post`, { content });
            const { success, data } = response.data;

            if (success) {

                const newComment = {
                    ...data,
                    userId: data.userId || useAuthStore.getState().user?.userId
                }

                get().addCommentToTop(newComment);
            }

        } catch (err: any) {
            console.log(err);
            showToast({ type: "error", message: err.response.data.message });
        } finally {
            set({ isCommentPosting: false });
        }
    },



    // add comment to top action
    addCommentToTop: (newComment: Comment) => {
        set((state: any) => ({
            comments: [newComment, ...state.comments],
            commentsCount: state.commentsCount + 1
        }));
    },



    // edit comment
    editComment: async (commentId: string, content: string): Promise<void> => {
        try {

            const response = await api.patch(`/comments/${commentId}/edit`, { content });
            const { success, message } = response.data;

            if (success) {

                set((state) => ({
                    comments: state.comments.map((c) =>
                        c.id === commentId ? { ...c, content: content } : c
                    )
                }));

                showToast({ type: "success", message })

            }

        } catch (err: any) {
            console.log(err);
            showToast({ type: "error", message: err.response.data.message });
        }
    },


    // delete comment action
    deleteComment: async (commentId: string): Promise<void> => {
        try {

            const response = await api.delete(`/comments/${commentId}/delete`);
            const { success, message } = response.data;

            set((state) => ({

                comments: state.comments.filter((c) => c.id !== commentId),
                commentsCount: Math.max(0, state.commentsCount - 1)

            }));

            if (success) {
                showToast({ type: "success", message });
            } else {
                showToast({ type: "error", message });
            }

        } catch (err: any) {
            console.log(err);
            showToast({ type: "error", message: err.response.data.message });
        }
    }

}));