"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, Heart, Bookmark, Share } from "lucide-react";
import Avatar from "../Avatar";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import Link from "next/link";
import { useLikeStore } from "@/stores/likeStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import CommentDrawer from "../comments/CommentDrawer";


type PostCardProps = {
    postId: string;
    avatar: string;
    name: string;
    username: string;
    time: string;
    content: string;
    media?: string;
    verified?: boolean;
    initialLikesCount: number;
    initialIsLiked: boolean;
    initialBookmarkCount: number;
    initialIsBookmarked: boolean;
    initialCommentsCount: number;
    initialIsCommented: boolean;
};


const PostCard = ({
    postId,
    avatar,
    name,
    username,
    time,
    content,
    media,
    initialLikesCount,
    initialIsLiked,
    initialBookmarkCount,
    initialIsBookmarked,
    initialCommentsCount,
    initialIsCommented

}: PostCardProps) => {

    const { likePost, unLikePost } = useLikeStore();
    const { savePost, unSavePost } = useBookmarkStore();

    // Local states for instant feedback
    const [liked, setLiked] = useState<boolean>(initialIsLiked);
    const [count, setCount] = useState<number>(initialLikesCount);
    const [isLiking, setIsLiking] = useState<boolean>(false);


    // drawer menu
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // comments count
    const [commentsCount, setCommentsCount] = useState<number>(initialCommentsCount);



    // local bookmark states
    const [bookmarked, setBookmarked] = useState<boolean>(initialIsBookmarked);
    const [bookmarkCount, setBookmarkCount] = useState<number>(initialBookmarkCount);
    const [isBookmarking, setIsBookmarking] = useState<boolean>(false);



    // Toggle Like Logic
    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking) return;

        setIsLiking(true);
        const originalLiked = liked;
        const originalCount = count;

        // Optimistic UI update
        setLiked(!originalLiked);
        setCount(originalLiked ? originalCount - 1 : originalCount + 1);

        try {

            const success = originalLiked ? await unLikePost(postId) : await likePost(postId);
            if (!success) throw new Error();

        } catch (err) {
            // Rollback agar fail ho jaye
            setLiked(originalLiked);
            setCount(originalCount);
        } finally {
            setIsLiking(false);
        }
    };



    // Toggle bookmark Logic
    const handleBookmarkToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookmarking) return;

        setIsBookmarking(true);
        const originalBookmark = bookmarked;
        const originalBookmarkCount = bookmarkCount;

        setBookmarked(!originalBookmark);
        setBookmarkCount(originalBookmark ? originalBookmarkCount - 1 : originalBookmarkCount + 1);

        try {

            const success = originalBookmark ? await unSavePost(postId) : await savePost(postId);
            if (!success) throw new Error();

        } catch (err) {
            // Rollback agar fail ho jaye
            setBookmarked(originalBookmark);
            setBookmarkCount(bookmarkCount);
        } finally {
            setIsBookmarking(false);
        }

    }

    return (

        <div className="flex gap-3 px-4 py-3 border-b border-(--input-border) hover:bg-(--hover)/50 transition cursor-pointer">


            {/* Avatar */}
            <div className="w-10 h-10">
                <Avatar userAvatar={avatar} />
            </div>


            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <Link href={`/${username}`} className="font-semibold text-(--text-color) text-[17px] hover:underline">{name}</Link>
                    <span className="text-(--secondary-text) text-[16px]">· {username}</span>
                    <span className="text-(--secondary-text)">· {useTimeAgo(time)}</span>
                </div>

                <p className="mt-1 text-(--text-color) leading-relaxed whitespace-pre-line">{content}</p>

                {media && (
                    <div className="h-87.5 w-full mt-3 rounded-xl overflow-hidden border border-(--input-border)">
                        <Image src={media} alt="post media" width={600} height={400} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex items-center justify-between px-1 mt-3 text-(--secondary-text)">

                    {/* Like Button */}
                    <div
                        onClick={handleLikeToggle}
                        className={`group flex items-center gap-1 cursor-pointer transition-all ${liked ? "text-red-500" : ""}`}
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-red-500/10 transition-all">
                            <Heart
                                size={18}
                                className={`transition-transform active:scale-125 ${liked ? "fill-red-500 text-red-500" : ""}`}
                            />
                        </div>
                        <span className="text-xs">{count > 0 ? count : ""}</span>
                    </div>



                    {/* Comment btn */}
                    <div
                        className={`group flex items-center gap-1 cursor-pointer transition-all ${initialIsCommented ? "text-blue-500" : ""}`}
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500">
                            <MessageCircle
                                size={18}
                                className={`transition-all ${initialIsCommented ? "fill-blue-500 text-blue-500" : ""}`}
                            />
                        </div>
                        <span className="text-xs">{commentsCount > 0 ? commentsCount : ""}</span>
                    </div>


                    {/* Drawer Component */}
                    <CommentDrawer
                        isOpen={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        postId={postId}
                        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                        onCommentDeleted={() => setCommentsCount(prev => prev - 1)}
                    />


                    {/* Bookmark Button */}
                    <div
                        className={`group flex items-center gap-1 cursor-pointer transition-all ${bookmarked ? "text-yellow-500" : "text-(--secondary-text)"}`}
                        onClick={handleBookmarkToggle}
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-yellow-500/10 transition-all">
                            <Bookmark
                                size={18}
                                className={`transition-all ${bookmarked ? "fill-yellow-500 text-yellow-500" : ""}`}
                            />
                        </div>
                        <span className="text-xs">{bookmarkCount > 0 ? bookmarkCount : ""}</span>
                    </div>


                    {/* Share Button */}
                    <div className="group flex items-center gap-1 cursor-pointer transition-all">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-cyan-500/10 group-hover:text-cyan-500">
                            <Share size={18} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PostCard;
