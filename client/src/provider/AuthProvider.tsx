"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Loader } from "lucide-react";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const { checkAuth, isCheckingAuth } = useAuthStore();


    // INTIALLY AUTH CHECKING
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={null}>

            {/* INITIALLY CHECH AUTH LOADING */}
            {isCheckingAuth ? (
                <div className="flex h-screen items-center justify-center bg-var(--bg-color)">
                    <Loader className="animate-spin duration-1000 mx-auto" color="var(--button-bg)" size={35} />
                </div>
            ) : (
                children
            )}

        </AuthContext.Provider>
    );
};
