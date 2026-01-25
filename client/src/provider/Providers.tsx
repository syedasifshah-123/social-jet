"use client";


import { ThemeToaster } from "@/components/ThemeToaster";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "../provider/AuthProvider";
import AuthGuard from "@/context/AuthGuard";


type ProviderChildren = {
    children: React.ReactNode;
}


export const Providers = ({ children }: ProviderChildren) => {

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