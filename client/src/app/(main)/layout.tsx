"use client";


import FamousPeople from "@/components/home/FamousPeople";
import SearchBar from "@/components/home/SearchBar";
import TrendingPosts from "@/components/home/TrendingPosts";
import Sidebar from "@/components/sidebar/Sidebar";


type HomeChildrenType = {
    children: React.ReactNode
}

const HomeLayout = ({ children }: HomeChildrenType) => {
    return (
        <div className="flex h-screen overflow-hidden px-20 max-sm:px-0 max-md:px-0">

            <div className="flex-1 max-md:flex-0 justify-items-end max-md:justify-items-start shrink-0">
                <Sidebar />
            </div>

            <div className="flex-2 border-r border-(--input-border) overflow-y-auto no-scrollbar">

                <div className="w-full">
                    {children}
                </div>

            </div>

            <div className="flex-1 max-md:hidden">

                <div className="flex flex-col gap-5 py-5 w-[320px] ms-auto">
                    {/* <SearchBar/>
                    <FamousPeople />
                    <TrendingPosts /> */}
                </div>

            </div>

        </div>
    )
}

export default HomeLayout;