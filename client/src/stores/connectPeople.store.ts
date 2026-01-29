import api from "@/config/axios";
import { ApiErrorResponse, TopPeoples } from "@/types/authTypes";
import { showToast } from "@/utils/showToast";
import { AxiosError } from "axios";
import { create } from "zustand";



interface ConnectPeopleState {

    isLoading: boolean;
    topPeoples: TopPeoples[],

    getTopPeoplesToConnect: () => Promise<void>;

}


export const useConnectPeopleStore = create<ConnectPeopleState>((set) => ({

    isLoading: false,
    topPeoples: [],

    getTopPeoplesToConnect: async (): Promise<void> => {
        
        set({ isLoading: true });

        try {

            const response = await api.get("/peoples/connect");
            const { success, data } = response.data;

            if (success) {
                set({ topPeoples: data });
            }
            
        } catch (err: unknown) {

            const error = err as AxiosError<ApiErrorResponse>;
            const serverMessage = error?.response?.data?.message;
            const msg = serverMessage || error.message || "Request failed";
            showToast({ type: 'error', message: msg });
            
        } finally {
            set({ isLoading: false });
        }
    }

}));