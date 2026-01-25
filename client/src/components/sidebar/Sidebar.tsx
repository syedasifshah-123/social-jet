import type { ComponentType } from "react";

import { useAuthStore } from "@/stores/authStore";
import SidebarLogo from "./SidebarLogo";
import SidebarMenu from "./SidebarMenu";
import SidebarProfile from "./SidebarProfile";
import { useModalContext } from "@/context/ModalContext";
import CreatePostCard from "../posts/CreatePostCard";
import { X } from "lucide-react";



const Sidebar = () => {

    const { user } = useAuthStore();
    const { openModal, closeModal } = useModalContext();


    const CreatePotModal = () => openModal(<>
        <div className="w-130 max-md:w-90">

            <div className="flex items-center justify-between px-5 pt-3">
                <h1 className="font-medium text-[19px]">Create Post</h1>
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover) transition-all cursor-pointer" onClick={closeModal}>
                    <X size={20}/>
                </div>
            </div>

            <CreatePostCard/>
        </div>
    </>)

    return (
        <aside className="h-screen w-20 md:w-75 border-r border-(--input-border) px-2 md:px-4 py-3 flex flex-col justify-between text-(--text-colo) transition-all duration-300">
            
            {/* TOP */}
            <div className="space-y-5">


                {/* LOGO */}
                <SidebarLogo />

                {/* MENU */}
                <div className="mt-14">
                    <SidebarMenu />
                </div>

                {/* POST (desktop) */}
                <button className="mt-4 w-full bg-(--text-color) text-(--bg-color) cursor-pointer font-bold text-lg py-2 rounded-full transition hidden md:block" onClick={CreatePotModal}>
                    Post
                </button>

                {/* POST (mobile) */}
                <button className="mt-4 mx-auto flex md:hidden items-center justify-center w-12 h-12  bg-(--text-color) text-(--bg-color) cursor-pointer rounded-full text-xl font-bold" onClick={CreatePotModal}>
                    +
                </button>

            </div>

            {/* USER Profile */}
            <SidebarProfile/>

        </aside>
    );
};

export default Sidebar;