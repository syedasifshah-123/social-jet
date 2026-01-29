"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ExplorePostsList from "@/components/posts/ExplorePostsList";
import { useProfileStore } from "@/stores/profileStore";
import { UserType } from "@/types/authTypes";

const ExplorePage = () => {


    const router = useRouter();
    const { isLoading, getAllUsers, users } = useProfileStore();

    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showResults, setShowResults] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement>(null);



    // initially get all users
    useEffect(() => {
        getAllUsers();
    }, []);




    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    // Filter Logic
    useEffect(() => {

        if (!searchTerm.trim()) {
            setFilteredUsers([]);
            return;
        }

        const filtered = users.filter((u: UserType) =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredUsers(filtered);
    }, [searchTerm, users]);



    return (
        <div className="min-h-screen bg-(--bg-color)">

            {/* Header & Search Wrapper */}
            <div className="sticky top-0 bg-(--bg-color) z-50 border-b border-(--input-border) px-4 py-2" ref={searchRef}>
                <div className="flex items-center gap-4">


                    {/* Back btn */}
                    <button onClick={() => router.back()} className="p-2 hover:bg-(--hover)/50 w-10 h-10 cursor-pointer flex items-center justify-center rounded-full transition-all">
                        <ArrowLeft color="var(--text-color)" />
                    </button>


                    {/* Input */}
                    <div className="relative flex-1">

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onFocus={() => setShowResults(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            className="w-full py-2.5 pl-11 pr-5 bg-(--hover)/20 border border-(--input-border) outline-none rounded-full focus:ring-1 focus:ring-blue-500 transition-all"
                        />

                        <Search className="absolute left-4 top-3 w-5 text-gray-500" />



                        {/* SEARCH DROPDOWN WRAPPER */}
                        {showResults && searchTerm.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-(--bg-color) border border-(--input-border) rounded-2xl shadow-2xl overflow-hidden max-h-100 overflow-y-auto z-60 custom-scrollbar">
                                {isLoading ? (
                                    <SearchSkeleton />
                                ) : (
                                    <div className="py-2 px-2">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (

                                                <div
                                                    key={user.id}
                                                    onClick={() => {
                                                        router.push(`/@${user.username}`);
                                                        setShowResults(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-(--hover)/40 cursor-pointer transition-all rounded-xl"
                                                >
                                                    <img
                                                        src={user.avatar || "/default-avatar.png"}
                                                        alt={user.name}
                                                        className="w-12 h-12 rounded-full object-cover border border-(--input-border)"
                                                    />

                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[17px] line-clamp-1 hover:underline">{user.name}</span>
                                                        <span className="text-gray-500 text-[15px]">@{user.username}</span>
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center text-gray-500 text-lg">
                                                No results found for "{searchTerm}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mt-4">
                <ExplorePostsList />
            </div>
        </div>
    );
};

const SearchSkeleton = () => (
    <div className="p-2 space-y-2">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-10 h-10 bg-(--hover)/40 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-(--hover)/40 rounded w-1/2" />
                    <div className="h-2 bg-(--hover)/40 rounded w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

export default ExplorePage;
