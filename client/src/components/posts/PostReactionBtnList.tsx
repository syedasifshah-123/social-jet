"use client";


import { Bookmark, Eye, Heart, MessageCircle, Share } from "lucide-react";
import CommentDrawer from "../comments/CommentDrawer";
import { useLikeStore } from "@/stores/likeStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useEffect, useState } from "react";
import { PostCardProps } from "@/stores/postStore";
import { useNumberToKilo } from "@/hooks/useNumberToKilo";


interface PostReactionBtnListProps {
    post: PostCardProps,
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}


const PostReactionBtnList = ({ post, onCommentAdded, onCommentDeleted }: PostReactionBtnListProps) => {

    const { likePost, unLikePost } = useLikeStore();
    const { savePost, unSavePost } = useBookmarkStore();

    // Local states for instant feedback
    const [liked, setLiked] = useState<boolean>(post.isLiked);
    const [count, setCount] = useState<number>(post.likesCount);
    const [isLiking, setIsLiking] = useState<boolean>(false);


    // drawer menu
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // comments count
    const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount);


    useEffect(() => {
        setCommentsCount(post.commentsCount);
    }, [post.commentsCount]);


    // local bookmark states
    const [bookmarked, setBookmarked] = useState<boolean>(post.isBookmarked);
    const [bookmarkCount, setBookmarkCount] = useState<number>(post.bookmarkCount);
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

            const success = originalLiked ? await unLikePost(post.post_id) : await likePost(post.post_id);
            if (!success) throw new Error();

        } catch (err) {
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

            const success = originalBookmark ? await unSavePost(post.post_id) : await savePost(post.post_id);
            if (!success) throw new Error();

        } catch (err) {
            // Rollback agar fail ho jaye
            setBookmarked(originalBookmark);
            setBookmarkCount(bookmarkCount);
        } finally {
            setIsBookmarking(false);
        }

    }


    // count format
    const format = useNumberToKilo();


    return (<>

        <div className="flex items-center justify-between text-(--secondary-text)">

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
                className={`group flex items-center gap-1 cursor-pointer transition-all ${post.isCommented ? "text-blue-500" : ""}`}
                onClick={() => setIsDrawerOpen(true)}
            >
                <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500">
                    <MessageCircle
                        size={18}
                        className={`transition-all ${post.isCommented ? "fill-blue-500 text-blue-500" : ""}`}
                    />
                </div>
                <span className="text-xs">{commentsCount > 0 ? commentsCount : ""}</span>
            </div>


            {/* Drawer Component */}
            <CommentDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                postId={post.post_id}
                onCommentAdded={() => {
                    setCommentsCount(prev => prev + 1);
                }}
                onCommentDeleted={() => {
                    setCommentsCount(prev => prev - 1);
                }}
            />


            {/* Bookmark Button */}
            <div
                className={`group flex items-center gap-1 cursor-pointer transition-all`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-orange-500/10 transition-all">
                    <Eye
                        size={18}
                    />
                </div>
                <span className="text-xs">{post.viewsCount > 0 ? format(post.viewsCount) : ""}</span>
            </div>


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

    </>);
}

export default PostReactionBtnList;