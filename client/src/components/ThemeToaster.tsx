"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export const ThemeToaster = () => {

    const { theme } = useTheme();

    const toastBG = theme === "dark" ? "var(--bg-color)" : "var(--bg-color)";
    const toastTextColor = theme === "dark" ? "var(--text-color)" : "var(--text-color)";
    const toastBorderColor = theme === "dark" ? "var(--input-border)" : "var(--input-border)";

    return (
        <Toaster
            position="top-right"
            duration={1500}
            toastOptions={{
                style: {
                    backgroundColor: toastBG,
                    color: toastTextColor,
                    border: `1px solid ${toastBorderColor}`,
                    fontFamily: 'var(--font-sohne)',
                    fontSize: "16px",
                    gap: '10px',
                    boxShadow: "none"
                },
            }}
        />
    );
};
