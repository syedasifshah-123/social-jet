"use client";


import React, { createContext, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const { checkAuth, isCheckingAuth } = useAuthStore();
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";


    // INTIALLY AUTH CHECKING
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={null}>

            {/* INITIALLY CHECH AUTH LOADING */}
            {isCheckingAuth ? (
                <div className="flex h-screen items-center justify-center bg-var(--bg-color)">
                    <Image
                        src={logoSrc}
                        className="mx-auto my-10"
                        alt="App Logo"
                        width={60}
                        height={60}
                        priority
                    />
                </div>
            ) : (
                children
            )}

        </AuthContext.Provider>
    );
};
