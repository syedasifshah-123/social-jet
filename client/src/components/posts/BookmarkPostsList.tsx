"use client";



import { useEffect } from 'react';
import PostCard from './PostCard';
import { BookmarkX, Loader } from 'lucide-react';
import Link from 'next/link';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { usePathname } from 'next/navigation';



const BookmarkPostsList = () => {

    const { getBookmarkedPosts, bookmarkPosts, isPostsLoading } = useBookmarkStore(); 4
    const pathname = usePathname();

    useEffect(() => {

        if (pathname !== "/bookmarks") return;

        const refreshData = async () => {
            await getBookmarkedPosts();
        };

        refreshData();

    }, [pathname]);


    if (!isPostsLoading && bookmarkPosts.length === 0) {
        return <div className='flex items-center justify-center mt-50'>
            <div className="flex flex-col gap-5">
                <BookmarkX size={50} color='var(--secondary-text)' className='mx-auto' />
                <p className='text-(--secondary-text) text-[18px]'>You've no bookmarks.</p>
                <Link href="/explore" className='surface-btn w-max mx-auto'>Explore</Link>
            </div>
        </div>
    }


    return (
        
        <div className="flex flex-col">

            {bookmarkPosts?.map((post: any) => (
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
            <div className="h-20 flex justify-center items-center">

                {isPostsLoading && (
                    <Loader className="animate-spin" color='var(--button-bg)' />
                )}

            </div>
        </div>

    );
};

export default BookmarkPostsList;