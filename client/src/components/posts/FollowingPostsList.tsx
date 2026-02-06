"use client";

import { useEffect } from 'react';
import PostCard from './PostCard';
import { usePostStore } from '@/stores/postStore';
import { Loader, UserX2Icon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

const FollowingPostList = ({ tab }: { tab: string }) => {

    const { getAllFollowingPosts, followingPosts, isPostLoading, followingHasMore } = usePostStore();

    // if the scroll view is reached 50%
    const { ref, inView } = useInView({
        threshold: 0.5, // trigger
    });

    // initially fetch
    useEffect(() => {
        const refreshData = async () => {
            // 1. Pehle purani state reset karein
            usePostStore.getState().resetFollowing();

            // 2. Phir nayi API call karein
            await getAllFollowingPosts();
        };

        refreshData();
        // getAllFollowingPosts();
    }, [tab]);


    // If user scroll the page and reached the page 50% then fetch more posts
    useEffect(() => {
        if (inView && followingHasMore && !isPostLoading) {
            getAllFollowingPosts();
        }
    }, [inView, followingHasMore, isPostLoading, getAllFollowingPosts]);



    if (!isPostLoading && followingPosts.length === 0) {
        return <div className='flex items-center justify-center mt-50'>
            <div className="flex flex-col gap-5">
                <UserX2Icon size={50} color='var(--secondary-text)' className='mx-auto' />
                <p className='text-(--secondary-text) text-[18px]'>You've no following yet.</p>
                <Link href="/explore" className='surface-btn w-max mx-auto'>Explore</Link>
            </div>
        </div>
    }


    return (

        <div className="flex flex-col">

            {followingPosts?.map((post: any) => (
                <PostCard
                    key={post.post_id}
                    post={post}
                />
            ))}


            {/* --- SENTINEL ELEMENT --- */}
            <div ref={ref} className="h-20 flex justify-center items-center">

                {isPostLoading && (
                    <Loader className="animate-spin" color='var(--button-bg)' />
                )}

                {!followingHasMore && followingPosts.length > 0 && (
                    <p className="text-gray-500 text-sm py-4">You've reached the end! 🎉</p>
                )}

            </div>
        </div>

    );
};

export default FollowingPostList;