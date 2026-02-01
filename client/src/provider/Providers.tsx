"use client";


import { ThemeToaster } from "@/components/ThemeToaster";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "../provider/AuthProvider";
import AuthGuard from "@/context/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notificationStore";


type ProviderChildren = {
    children: React.ReactNode;
}


export const Providers = ({ children }: ProviderChildren) => {

    const { user } = useAuthStore();
    const {
        initSocket,
        disconnectSocket,
        fetchNotifications,
    } = useNotificationStore();



    // initially fetching all notifications and cerating socket connections
    useEffect(() => {

        // if user avaialable then init socket
        if (user) {
            initSocket(user.userId);
            fetchNotifications();
        }


        // in the cleanup function disconnect socket
        return () => {
            disconnectSocket();
        }

    }, [user?.userId, initSocket, fetchNotifications]);

    return <>

        <ThemeProvider>
            <ThemeToaster />
            <AuthProvider>
                <AuthGuard>
                    <ModalProvider>
                        {children}
                    </ModalProvider>
                </AuthGuard>
            </AuthProvider>
        </ThemeProvider>

    </>;
}