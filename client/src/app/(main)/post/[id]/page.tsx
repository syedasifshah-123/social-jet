"use client";


import CommentCard from "@/components/comments/CommentCard";
import FollowButton from "@/components/FollowBtn";
import PostReactionBtnList from "@/components/posts/PostReactionBtnList";
import { useNumberToKilo } from "@/hooks/useNumberToKilo";
import { useCommentStore } from "@/stores/commentStore";
import { usePostStore } from "@/stores/postStore";
import { useProfileStore } from "@/stores/profileStore";
import { showToast } from "@/utils/showToast";
import { ArrowLeft, Edit, Loader, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface PostDetailProps {
    postId: string;
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}



const PostDetail = ({ onCommentAdded, onCommentDeleted }: PostDetailProps) => {

    const router = useRouter();

    const { id } = useParams();
    const { getPostDetail, post, isPostLoading } = usePostStore();
    const { getUserProfile, userProfile } = useProfileStore();


    // comment content state
    const [commentContent, setCommentContent] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);


    useEffect(() => {
        getPostDetail(id as string);
    }, [id, getPostDetail]);



    // getting profile
    useEffect(() => {
        if (post?.user?.username) {
            getUserProfile(post.user.username);
        }
    }, [post?.user?.username, getUserProfile]);



    // date format
    const formattedDate = post?.created_at ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(new Date(post.created_at)) + ' · ' + new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(post.created_at)) : '';



    // Comment logic
    const { getComments, commentsCount, postComment, isCommentPosting, editComment } = useCommentStore();
    const [localCommentsCount, setLocalCommentsCount] = useState<number>(0);


    // sync comments count from store
    useEffect(() => {
        setLocalCommentsCount(commentsCount);
    }, [commentsCount]);


    useEffect(() => {
        if (post?.post_id) {
            getComments(post?.post_id);
        }
    }, [post?.post_id, getComments]);


    // Edit mode activate karne ka function
    const handleEditClick = (id: string, content: string) => {
        setEditingCommentId(id);
        setCommentContent(content);
    };



    // notify parent
    const handleCommentAdded = () => {
        setLocalCommentsCount(prev => prev + 1);
    };

    const handleCommentDeleted = () => {
        setLocalCommentsCount(prev => prev - 1);
    };



    // comment submit
    const handleSubmit = async () => {

        if (commentContent === "") {
            showToast({ type: "error", message: "Enter comment!" });
            return;
        }

        if (!post?.post_id) return;

        try {

            if (editingCommentId) {

                editComment(editingCommentId, commentContent);
                setEditingCommentId(null);
                setCommentContent("");

            } else {

                await postComment(post?.post_id || "hhhh", commentContent);
                setCommentContent("");

            }

        } catch (err) {
            throw err;
        }
    }



    // counting format
    const format = useNumberToKilo();


    return (<>

        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">

            {/* Header */}
            <div className="flex items-center gap-4 px-4 h-15 sticky top-0 bg-(--bg-color) z-50 border-b border-(--input-border)">

                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover)/50 transition-all cursor-pointer" onClick={() => {
                    router.back()
                }}>
                    <ArrowLeft className="w-5 h-5 cursor-pointer" />
                </button>

                <h2 className="text-[18px] font-medium">Post</h2>

            </div>


            {/* Post detail */}
            {isPostLoading ? (
                <Loader className="animate-spin mx-auto mt-10" color="var(--button-bg)" />
            ) : (<>


                {/* Post detail */}
                <div className="p-5 flex items-center justify-between border-b border-(--input-border)">

                    {/* User avatar */}
                    <div className="flex items-center gap-3">

                        <Image
                            src={post?.user?.avatar || '/default-avatar.png'}
                            className="w-12 h-12 rounded-full object-cover border border-(--input-border)"
                            alt={post?.user?.username || "User avatar"}
                            width={48}
                            height={48}
                        />

                        <div className="flex flex-col">
                            <Link href={`@${post?.user?.username}`} className="font-bold text-[15px] leading-tight text-(--text-color) hover:underline">
                                {post?.user?.name}
                            </Link>
                            <p className="text-sm text-(--secondary-text)">
                                @{post?.user?.username}
                            </p>
                        </div>

                    </div>

                    {/* Follow Button */}
                    <div className="shrink-0">
                        <FollowButton
                            initialIsFollowing={userProfile?.isFollowing}
                            targetUserId={userProfile?.id}
                            username={userProfile?.username}
                        />
                    </div>

                </div>


                {/* Content & media & createdAt */}
                <div className="p-5">

                    <p className="whitespace-pre">{post?.content}</p>

                    {post?.media_url && (<>
                        <div className="h-87.5 w-full mt-3 rounded-xl overflow-hidden border border-(--input-border)">
                            <Image src={post?.media_url} alt="post media" width={600} height={400} className="w-full h-full object-cover" />
                        </div>
                    </>)}

                    <div className="flex items-center gap-1 mt-4 px-1 text-[15px] text-(--secondary-text) border-b border-(--input-border) pb-4">
                        <span>{formattedDate}</span>
                        <span>·</span>
                            <span className="text-(--text-color) font-bold">{format(post?.viewsCount as number)}</span>
                        <span className="ml-0.5">Views</span>
                    </div>

                </div>


                {/* Reaction buttons */}
                <div className="px-5 -mt-1.25 border-b border-(--input-border) pb-3.5">
                    {post && (
                        <PostReactionBtnList
                            post={{
                                ...post,
                                commentsCount: localCommentsCount
                            }}
                            onCommentAdded={handleCommentAdded}
                            onCommentDeleted={handleCommentDeleted}
                        />
                    )}
                </div>



                {/* Comments section */}
                <div className="p-5">

                    {/* Heading */}
                    <h2 className="text-xl font-bold text-(--text-color)">{localCommentsCount}
                        {localCommentsCount > 1 || localCommentsCount == 0 ? " Comments" : " Comment"}
                    </h2>


                    {/* Input */}
                    <div className="w-full flex items-center gap-2 max-sm:flex max-sm:flex-col mt-3 mb-3">

                        <input
                            type="text"
                            placeholder='Post your comment'
                            className='input'
                            name='content'
                            autoComplete='off'
                            value={commentContent}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentContent(e.target.value)}
                        />

                        <button className='primary-btn px-3 h-10.75 rounded-lg max-sm:w-full'
                            onClick={handleSubmit}
                        >
                            {isCommentPosting ? <Loader className='animate-spin' color='var(--bg-color)' /> : editingCommentId ? <Edit color='var(--bg-color)' className='max-sm:mx-auto' /> : <Send color='var(--bg-color)' className='max-sm:mx-auto' />}
                        </button>

                    </div>

                </div>


                {/* Comment card */}
                <div className="mb-10">
                    <CommentCard
                        onCommentDeleted={onCommentDeleted}
                        onEditClick={handleEditClick}
                    />
                </div>


            </>)}

        </div>

    </>);
}

export default PostDetail;