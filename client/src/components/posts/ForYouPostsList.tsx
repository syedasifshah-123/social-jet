"use client";

import { useEffect } from 'react';
import PostCard from './PostCard';
import { usePostStore } from '@/stores/postStore';
import { Loader } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const ForYouPostsList = ({ tab }: { tab: string }) => {

    const { getAllForYouPosts, forYouPosts, isPostLoading, forYouHasMore } = usePostStore();

    // if the scroll view is reached 50%
    const { ref, inView } = useInView({
        threshold: 0.5, // trigger
    });


    // initially fetch
    useEffect(() => {
        const refreshData = async () => {
            // 1. Pehle purani state reset karein
            usePostStore.getState().resetForYou();

            // 2. Phir nayi API call karein
            await getAllForYouPosts();
        };

        refreshData();
    }, [tab]);


    // If user scroll the page and reached the page 50% then fetch more posts
    useEffect(() => {
        if (inView && forYouHasMore && !isPostLoading) {
            getAllForYouPosts();
        }
    }, [inView, forYouHasMore, isPostLoading, getAllForYouPosts]);



    return (

        <div className="flex flex-col">

            {forYouPosts?.map((post: any) => (
                <PostCard
                    key={post.post_id}
                    avatar={post?.user?.avatar}
                    name={post?.user?.name}
                    username={`@${post?.user?.username}`}
                    time={post.created_at}
                    content={post.content}
                    media={post.media_url}
                />
            ))}


            {/* --- SENTINEL ELEMENT --- */}
            <div ref={ref} className="h-20 flex justify-center items-center">

                {isPostLoading && (
                    <Loader className="animate-spin" color='var(--button-bg)' />
                )}

                {!forYouHasMore && forYouPosts.length > 0 && (
                    <p className="text-gray-500 text-sm py-4">You've reached the end! 🎉</p>
                )}

            </div>
        </div>

    );
};

export default ForYouPostsList;
