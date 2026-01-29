"use client";


import { useEffect, useState } from "react";
import { useFollowStore } from "@/stores/followStore";
import { useAuthStore } from "@/stores/authStore";
import { Loader, X } from "lucide-react";
import { useModalContext } from "@/context/ModalContext";



// follow btn props
interface FollowBtnProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    username: string;
}


const FollowButton = ({ targetUserId, initialIsFollowing, username }: FollowBtnProps) => {

    const { openModal, closeModal } = useModalContext();
    const { user: currentUser } = useAuthStore();
    const { followUser, unFollowUser, isLoading } = useFollowStore();


    // Initial following
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);



    // Local state for instant UI update
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    // if my own profile don't show follow button
    if (currentUser?.userId === targetUserId) return null;


    // handle follow
    const handleFollow = async () => {
        const success = await followUser(targetUserId);
        if (success) setIsFollowing(true);
    };



    // handle unfollow
    const handleUnfollow = async () => {
        const success = await unFollowUser(targetUserId);
        if (success) setIsFollowing(false);
    }



    const UnFollowModal = () => openModal(<>

        <div className="w-130 max-md:w-90">

            <div className="flex items-center justify-between px-5 pt-3">
                <h1 className="font-medium text-[19px]">Unfollow
                    <span className="text-(--secondary-text) pl-2">{""}@{username}?</span>
                </h1>
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover) transition-all cursor-pointer" onClick={closeModal}>
                    <X size={20} />
                </div>
            </div>

            <div className="flex flex-col py-2 px-5">
                <p className="text-(--secondary-text)">Their posts will no longer show up in your Following timeline. You can still view their profile, unless their posts are protected. </p>

                <div className="flex items-center gap-3 pt-6 pb-3 pr-5 ms-auto">
                    <button className="secondary-btn w-max px-5" onClick={closeModal}>Cancel</button>
                    <button className="danger-btn" onClick={() => {
                        handleUnfollow();
                        closeModal(); 
                    }}>Unfollow</button>
                </div>

            </div>

        </div>

    </>);



    return (

        <div className="flex items-center justify-center">

            {isFollowing ? (
                /* --- UNFOLOW BUTTON--- */
                <button
                    onClick={UnFollowModal}
                    className="cursor-pointer min-w-27.5 px-6 py-2 rounded-full font-bold transition-all duration-200 border border-(--input-border) text-(--text-color) hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-600"
                >
                    Unfollow
                </button>
            ) : (


                <button
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className="cursor-pointer surface-btn"
                >
                    {isLoading ? <Loader className="animate-spin mx-auto duration-100" color="var(--bg-color)" /> : "Follow"}
                </button>
            )}

        </div>

    );
};


export default FollowButton;