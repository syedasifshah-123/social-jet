import { PostCardProps } from "@/stores/postStore";
import { useRouter } from "next/navigation";
import Avatar from "../Avatar";
import Link from "next/link";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import Image from "next/image";
import PostReactionBtnList from "./PostReactionBtnList";



const PostCard = ({ post }: { post: PostCardProps }) => {

    const router = useRouter();

    return (
        <div className="border-b border-(--input-border) hover:bg-(--hover)/50 transition cursor-pointer">

            {/* {Avatar + content} */}
            <div
                className="flex gap-3 px-4 pt-3 pb-1"
                onClick={() => router.push(`/post/${post.post_id}`)}
            >


                {/* Avatar */}
                <div className="w-10 h-10 shrink-0">
                    <Avatar userAvatar={post.user.avatar} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm flex-wrap">

                        <Link
                            href={`/@${post.user.username}`}
                            className="font-semibold text-(--text-color) text-[17px] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {post.user.name}
                        </Link>

                        <span className="text-(--secondary-text) text-[16px]">@{post.user.username}</span>
                        <span className="text-(--secondary-text)">· {useTimeAgo(post.created_at)}</span>

                    </div>

                    <p className="mt-1 text-(--text-color) leading-relaxed whitespace-pre-line">
                        {post.content}
                    </p>

                    {post.media_url && (
                        <div className="h-87.5 w-full mt-3 rounded-xl overflow-hidden border border-(--input-border)">
                            <Image src={post.media_url} alt="post media" width={600} height={400} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>



            {/* Post reaction btn */}
            <div className="pl-16 pr-4 pb-2">
                <PostReactionBtnList post={post} />
            </div>

        </div>
    );
};


export default PostCard;