"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";


const PROTECTED_ROUTES = ["/home", "/create-profile", "/verify-otp", "/explore", "/connect_people", "/notifications", "/bookmarks", "/profile"];
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];


export default function AuthGuard({ children }: { children: React.ReactNode }) {

    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isCheckingAuth) {

            // 1. IF ROUTES IS PROTECTED AND USER IS NOT LOGGED IN RETURN TO LOGIN
            if (PROTECTED_ROUTES.includes(pathname) && !isAuthenticated) {
                router.replace("/login");
            }

            // 2. IF ROUTES ARE PUBLIC AND USER IS LOGGED IN RETURN TO HOME PAGE
            if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) {
                router.replace("/home");
            }
        }

    }, [isAuthenticated, isCheckingAuth, pathname, router]);

    // HANDLING LOADING STATE
    if (isCheckingAuth) {
        return <div>Loading App...</div>;
    }

    // UI PROTECTION
    if (PROTECTED_ROUTES.includes(pathname) && !isAuthenticated) return null;
    if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) return null;

    return <>{children}</>;
}
