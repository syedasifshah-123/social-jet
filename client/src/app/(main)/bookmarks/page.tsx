"use client";


import BookmarkPostsList from "@/components/posts/BookmarkPostsList";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BookmarkPage = () => {

    const router = useRouter();

    return (<>

        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">

            {/* Header */}
            <div className="flex items-center gap-4 px-4 h-15 sticky top-0 bg-(--bg-color) z-10 border-b border-(--input-border)">

                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover)/50 transition-all cursor-pointer" onClick={() => {
                    router.back()
                }}>
                    <ArrowLeft className="w-5 h-5 cursor-pointer" />
                </button>

                <h2 className="text-[18px] font-medium">Bookmarks</h2>

            </div>


            {/* Main Section */}
            <BookmarkPostsList />

        </div>

    </>);
}

export default BookmarkPage;