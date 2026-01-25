"use client";

import Image from "next/image";
import {
    ArrowLeft,
    Loader,
    MoreHorizontal,
    UserPlus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/profileStore";
import { useEffect } from "react";
import FollowButton from "@/components/FollowBtn";

export default function ProfilePage() {


    const router = useRouter();

    const params = useParams();
    const profileHandle = params.profile as string;

    const { getUserProfile, userProfile, isLoading } = useProfileStore();



    // initially get user profile
    useEffect(() => {
        if (profileHandle) {

            // remove @ from username
            const cleanUsername = profileHandle.startsWith('%40')
                ? profileHandle.replace('%40', '')
                : profileHandle.replace('@', '');

            getUserProfile(cleanUsername);

        }
    }, [profileHandle, getUserProfile]);



    // handle date format
    const handleDateFormat = (date: string | Date) => {
        if (!date) return "";

        const d = new Date(date);

        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
        const year = d.getFullYear();

        return `Joined ${month} ${year}`;
    };


    if (isLoading) {
        return <div className="flex items-center justify-center mt-20">
            <Loader className="animate-spin duration-100" color="var(--button-bg)" />
        </div>
    };

    return (
        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">

            {/* Header */}
            <div className="flex items-center gap-4 px-4 h-15 sticky top-0 bg-(--bg-color) z-50 border-b border-(--input-border)">

                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover)/50 transition-all cursor-pointer" onClick={() => {
                    router.back()
                }}>
                    <ArrowLeft className="w-5 h-5 cursor-pointer" />
                </div>

                <div className="flex flex-col">
                    <h1 className="font-bold text-lg">{userProfile?.name}</h1>
                    <p className="text-sm text-(--secondary-text)">{userProfile?.postCount ?? 'No'} Posts</p>
                </div>

            </div>

            {/* Cover */}
            <div className="relative h-44 bg-(--hover)">
                {userProfile?.profile?.banner ? <Image
                    src={userProfile?.profile?.banner}
                    alt="cover"
                    fill
                    className="object-cover"
                /> : <div className="bg-(--hover) w-full" />}
            </div>

            {/* Profile Info */}
            <div className="px-4">

                {/* Avatar + Actions */}
                <div className="flex justify-between items-start -mt-16">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-(--input-border) bg-(--hover)">
                        <Image
                            src={userProfile?.profile?.avatar || "/default-avatar.png"}
                            alt="avatar"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-20">

                        <FollowButton
                            targetUserId={userProfile?.id}
                            initialIsFollowing={userProfile?.isFollowing}
                        />

                    </div>

                </div>

                {/* Name */}
                <div className="mt-3">
                    <h2 className="text-xl font-bold flex items-center gap-1">
                        {userProfile?.name}
                        <span className="text-blue-500">✔</span>
                    </h2>
                    <p className="text-neutral-500">@{userProfile?.username}</p>
                </div>

                {/* Meta */}
                <p className="text-neutral-500 text-sm mt-2">
                    {handleDateFormat(userProfile?.joinData)}
                </p>

                {/* Stats */}
                <div className="flex gap-6 mt-3 text-sm">
                    <span>
                        <b className="text-(--text-color)">{userProfile?.followingCount}</b>{" "}
                        <span className="text-(--secondary-text)">Following</span>
                    </span>
                    <span>
                        <b className="text-(--text-color)">{userProfile?.followersCount}</b>{" "}
                        <span className="text-(--secondary-text)">Followers</span>
                    </span>
                </div>

            </div>

        </div>
    );
}
