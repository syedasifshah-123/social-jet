"use client";


import FollowButton from "@/components/FollowBtn";
import { useAuthStore } from "@/stores/authStore";
import { useConnectPeopleStore } from "@/stores/connectPeople.store";
import { TopPeoples } from "@/types/authTypes";
import { ArrowLeft, Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ConnectPeople = () => {


    const router = useRouter();
    const { topPeoples, getTopPeoplesToConnect, isLoading } = useConnectPeopleStore();


    // get current user
    const { user: currentUser } = useAuthStore();


    useEffect(() => {
        getTopPeoplesToConnect();
    }, []);


    return (<>

        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">

            {/* Header */}
            <div className="flex items-center gap-4 px-4 h-15 sticky top-0 bg-(--bg-color) z-50 border-b border-(--input-border)">

                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover)/50 transition-all cursor-pointer" onClick={() => {
                    router.back()
                }}>
                    <ArrowLeft className="w-5 h-5 cursor-pointer" />
                </button>

                <h2 className="text-[18px] font-medium">Follows</h2>

            </div>


            <h2 className="pt-5 px-5 text-[20px] font-medium">Who to follow</h2>

            {/* Main Section */}
            <div className="flex flex-col">


                {/* Top users lists */}
                <div className="mt-5 w-full flex flex-col items-center justify-between">

                    {/* User card */}
                    {isLoading ? <Loader className="animate-spin duration-100 mt-10" color="var(--button-bg)" size={25} /> : topPeoples.map((p: TopPeoples, idx: number) => {

                        // If current user then skip 
                        if (p.id === currentUser?.userId) return null;
                        if (p.isFollowing === true) return null;

                        return (
                            <div key={p.id} className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-(--hover)/40 cursor-pointer transition-all border-(--input-border) ${idx === 0 ? "border-t border-b" : "border-b"}`}>

                                {/* Avatar and username */}
                                <div className="flex items-center gap-2" onClick={() => router.push(`/${p.username}`)}>
                                    {/* Avatar */}
                                    <Image
                                        src={p.avatar || "/default-avatar.png"}
                                        alt={p.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover border border-(--input-border)"
                                    />

                                    {/* Name and username */}
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold text-[17px] line-clamp-1 hover:underline">
                                            {p.name}
                                        </span>
                                        <span className="text-gray-500 text-[15px]">@{p.username}</span>
                                    </div>
                                </div>

                                {/* Follow button */}
                                <FollowButton
                                    targetUserId={p.id}
                                    initialIsFollowing={p.isFollowing}
                                    username={p.username}
                                />
                            </div>
                        );
                    })}


                </div>

            </div>


        </div>

    </>);
}

export default ConnectPeople;