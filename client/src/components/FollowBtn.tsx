"use client";

import { useEffect, useState } from "react";
import { useFollowStore } from "@/stores/followStore";
import { useAuthStore } from "@/stores/authStore";
import { Loader, X } from "lucide-react";
import { useModalContext } from "@/context/ModalContext";

interface FollowBtnProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    username: string;
}

const FollowButton = ({ targetUserId, initialIsFollowing, username }: FollowBtnProps) => {

    const { openModal, closeModal } = useModalContext();
    const { user: currentUser } = useAuthStore();
    const { followUser, unFollowUser } = useFollowStore();

    // Local states for this specific button instance
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [localLoading, setLocalLoading] = useState(false);

    // Sync with initial prop if it changes
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    if (currentUser?.userId === targetUserId) return null;

    // Handle Follow
    const handleFollow = async () => {
        setLocalLoading(true); // Sirf isi button ka spinner chalega
        const success = await followUser(targetUserId);
        if (success) setIsFollowing(true);
        setLocalLoading(false);
    };

    // Handle Unfollow (Modal se call hoga)
    const handleUnfollowAction = async () => {
        setLocalLoading(true);
        const success = await unFollowUser(targetUserId);
        if (success) setIsFollowing(false);
        setLocalLoading(false);
        closeModal();
    };

    const openUnFollowModal = () => openModal(
        <div className="w-130 max-md:w-90">
            <div className="flex items-center justify-between px-5 pt-3">
                <h1 className="font-medium text-[19px]">Unfollow
                    <span className="text-(--secondary-text) pl-2">@{username}?</span>
                </h1>
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover) transition-all cursor-pointer" onClick={closeModal}>
                    <X size={20} />
                </div>
            </div>
            <div className="flex flex-col py-2 px-5">
                <p className="text-(--secondary-text)">
                    Their posts will no longer show up in your Following timeline.
                </p>
                <div className="flex items-center gap-3 pt-6 pb-3 pr-5 ms-auto">
                    <button className="secondary-btn w-max px-5" onClick={closeModal}>Cancel</button>
                    <button
                        className="danger-btn"
                        onClick={handleUnfollowAction}
                    >
                        Unfollow
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex items-center justify-center">

            {isFollowing ? (
                <button
                    onClick={openUnFollowModal}
                    disabled={localLoading}
                    className="cursor-pointer min-w-27.5 px-6 py-2 rounded-full font-bold transition-all duration-200 border border-(--input-border) text-(--text-color) hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-600 flex items-center justify-center"
                >
                    {localLoading ? <Loader className="animate-spin" size={22} /> : "Following"}
                </button>
            ) : (
                <button
                    onClick={handleFollow}
                    disabled={localLoading}
                    className="cursor-pointer surface-btn min-w-27.5 flex items-center justify-center"
                >
                    {localLoading ? (
                        <Loader className="animate-spin" color="var(--bg-color)" size={22} />
                    ) : (
                        "Follow"
                    )}
                </button>
            )}
        </div>
    );
};

export default FollowButton;
