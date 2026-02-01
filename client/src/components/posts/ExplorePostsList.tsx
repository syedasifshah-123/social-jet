"use client";

import { useEffect } from 'react';
import PostCard from './PostCard';
import { usePostStore } from '@/stores/postStore';
import { Loader } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
// import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ExplorePostsList = () => {

    const { getAllExplorePosts, explorePosts, isPostLoading, exploreHasMore } = usePostStore();
    const pathname = usePathname();


    // if the scroll view is reached 50%
    const { ref, inView } = useInView({
        threshold: 0.5, // trigger
    });

    // initially fetch
    useEffect(() => {

        if (pathname !== "/explore") return;

        const refreshData = async () => {
            // 1. Pehle purani state reset karein
            usePostStore.getState().resetFollowing();

            // 2. Phir nayi API call karein
            await getAllExplorePosts();
        };

        refreshData();

    }, [pathname]);


    // If user scroll the page and reached the page 50% then fetch more posts
    useEffect(() => {
        if (inView && exploreHasMore && !isPostLoading) {
            getAllExplorePosts();
        }
    }, [inView, exploreHasMore, isPostLoading, getAllExplorePosts]);


    return (

        <div className="flex flex-col">

            {explorePosts?.map((post: any) => (
                <PostCard
                    key={post.post_id}
                    postId={post.post_id}
                    avatar={post?.user?.avatar}
                    name={post?.user?.name}
                    username={`@${post?.user?.username}`}
                    time={post.created_at}
                    content={post.content}
                    media={post.media_url}
                    initialLikesCount={post.likesCount}
                    initialIsLiked={post.isLiked}
                    initialBookmarkCount={post.bookmarkCount}
                    initialIsBookmarked={post.isBookmarked}
                />
            ))}


            {/* --- SENTINEL ELEMENT --- */}
            <div ref={ref} className="h-20 flex justify-center items-center">

                {isPostLoading && (
                    <Loader className="animate-spin" color='var(--button-bg)' />
                )}

                {!exploreHasMore && explorePosts.length > 0 && (
                    <p className="text-gray-500 text-sm py-4">You've reached the end! 🎉</p>
                )}

            </div>
        </div>

    );
};

export default ExplorePostsList;