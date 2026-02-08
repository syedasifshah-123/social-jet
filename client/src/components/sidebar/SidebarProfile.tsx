"use client";


import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, Settings, Moon, Sun, ChevronLeft, UserCircle, X } from "lucide-react";
import Avatar from "../Avatar";
import { motion } from "framer-motion";
import { useModalContext } from "@/context/ModalContext";
import { useRouter } from "next/navigation";


const SidebarProfile = () => {

    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [menuView, setMenuView] = useState<"main" | "theme">("main");
    const { openModal, closeModal } = useModalContext();

    const router = useRouter();


    const LogoutModal = () => openModal(<>
        <div className="w-130 max-md:w-90">

            <div className="flex items-center justify-between px-5 pt-3">
                <h1 className="font-medium text-[19px]">Logout of JET</h1>
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover) transition-all cursor-pointer" onClick={closeModal}>
                    <X size={20} />
                </div>
            </div>

            <div className="flex flex-col py-2 px-5">
                <p className="text-(--secondary-text)">You can always log back in at any time. If you just want to switch accounts, you can do that by adding an existing account. </p>

                <div className="flex items-center gap-3 pt-6 pb-3 pr-5 ms-auto">
                    
                    <button className="secondary-btn w-max px-3" onClick={closeModal}>Cancel</button>

                    <button className="danger-btn" onClick={() => {
                        handleLogout();
                        closeModal();
                    }}>Logout</button>

                </div>

            </div>

        </div>
    </>);



    // logout modal
    const handleLogout = () => {
        logout();
    };


    return (
        <div className="relative w-full">

            {/* --- Profile Trigger --- */}
            <div
                onClick={() => { setIsOpen(!isOpen); setMenuView("main"); }}
                className="flex items-center gap-3 ps-2 pr-4 py-1.5 w-max rounded-full hover:bg-(--hover) hover:pr-2 cursor-pointer transition-all sm:ml-1"
            >
                <Avatar userAvatar={user?.avatar} />
                <div className="flex-1 max-xl:hidden">
                    <p className="font-bold text-[15px] leading-tight">{user?.name}</p>
                    <p className="text-(--secondary-text) text-[15px]">@{user?.username}</p>
                </div>
            </div>


            {/* --- Dropdown Menu --- */}
            {isOpen && (
                <motion.div className="absolute bottom-16 left-0 w-64 bg-(--bg-color) border border-(--input-border) rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2 px-2"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}>

                    {menuView === "main" ? (
                        /* --- MAIN MENU --- */
                        <div className="flex flex-col">

                            <button className="flex items-center gap-3 px-4 py-3 hover:bg-(--hover) transition rounded-xl cursor-pointer" onClick={() => {
                                router.push("/edit-profile");
                                setIsOpen(false);
                            }}>
                                <UserCircle size={20} /> 
                                <p className="font-medium ">Edit Profile</p>
                            </button>

                            <button
                                onClick={() => setMenuView("theme")}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-(--hover) transition text-left font-bold rounded-xl cursor-pointer"
                            >
                                <Settings size={20} /> 
                                <p className="font-medium">Preferences</p>
                            </button>

                            <div className="h-px bg-(--input-border) my-2" />

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    LogoutModal();
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-(--hover) transition text-left font-medium rounded-xl cursor-pointer text-red-500"
                            >
                                <LogOut size={20} /> Log out
                            </button>
                        </div>
                    ) : (
                        /* --- THEME / PREFERENCE MENU --- */
                        <div className="flex flex-col">
                            <button
                                onClick={() => setMenuView("main")}
                                className="flex items-center gap-2 px-4 py-2 text-(--secondary-text) hover:text-(--text-color) transition text-sm mb-1 cursor-pointer"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                            <div className="px-4 py-2 font-bold text-lg">Display</div>

                            <button
                                onClick={() => {
                                    setTheme("light");
                                    setMenuView("main")
                                }}
                                className={`flex items-center justify-between px-4 py-3 hover:bg-(--hover) transition rounded-xl cursor-pointer ${theme === 'light' ? 'text-blue-500' : ''}`}
                            >
                                <div className="flex items-center gap-3"><Sun size={18} /> Light Mode</div>
                                {theme === 'light' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </button>

                            <button
                                onClick={() => {
                                    setTheme("dark")
                                    setMenuView("main")
                                }}
                                className={`flex items-center justify-between px-4 py-3 hover:bg-(--hover) transition rounded-xl cursor-pointer ${theme === 'dark' ? 'text-blue-500' : ''}`}
                            >
                                <div className="flex items-center gap-3"><Moon size={18} /> Dark Mode</div>
                                {theme === 'dark' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </button>

                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default SidebarProfile;
