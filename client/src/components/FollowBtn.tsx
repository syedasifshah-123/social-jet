"use client";
import { useEffect, useState } from "react";
import { useFollowStore } from "@/stores/followStore";
import { useAuthStore } from "@/stores/authStore";
import { Loader } from "lucide-react";

const FollowButton = ({ targetUserId, initialIsFollowing }: { targetUserId: string, initialIsFollowing: boolean }) => {

    const { user: currentUser } = useAuthStore();
    const { followUser, unFollowUser, isLoading } = useFollowStore();


    // Initial following
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);



    // Local state for instant UI update
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    // if my own profile don't show follow button
    if (currentUser?.id === targetUserId) return null;


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


    return (

        <div className="flex items-center justify-center">
            {isFollowing ? (
                /* --- UNFOLOW BUTTON (Jab user already follow kar raha ho) --- */
                <button
                    onClick={handleUnfollow}
                    disabled={isLoading}
                    className="group cursor-pointer min-w-27.5 px-6 py-2 rounded-full font-bold transition-all duration-200 border border-(--input-border) text-(--text-color) hover:border-red-600/50 hover:bg-red-600/10 hover:text-red-600"
                >
                    {isLoading ? "..." : (
                        <>
                            <span className="group-hover:hidden">Following</span>
                            <span className="hidden group-hover:inline">Unfollow</span>
                        </>
                    )}
                </button>
            ) : (


                <button
                    onClick={handleFollow}
                    disabled={isLoading}
                    className="cursor-pointer surface-btn"
                >
                    {isLoading ? <Loader className="animate-spin mx-auto duration-100" color="var(--bg-color)" /> : "Follow"}
                </button>
            )}

        </div>

    );
};


export default FollowButton;