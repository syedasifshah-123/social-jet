import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { useCommentStore } from "@/stores/commentStore";



interface CommentItemProps {
    comment: any;
    isFirst: boolean,
    onCommentDeleted: () => void;
    onEditClick: (id: string, content: string) => void;
}


const CommentItem = ({ comment, isFirst, onCommentDeleted, onEditClick }: CommentItemProps) => {

    const { user } = useAuthStore();
    const { deleteComment } = useCommentStore();
    const [showMenu, setShowMenu] = useState(false);
    const isOwner = user?.userId === comment.userId;

    return (

        <div
            className={`group relative flex items-start gap-3 px-5 py-3 transition-all duration-200 text-(--text-color) border-b border-(--input-border) ${isFirst ? "border-t" : ""
                }`}
        >

            <div className="relative shrink-0 mt-1">
                <img
                    src={comment.user?.avatar || '/default-avatar.png'}
                    alt={comment.user?.username}
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-(--input-border)"
                />
            </div>


            {/* user name and comment content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <Link
                            href={`/@${comment.user?.username}`}
                            className="font-bold text-[14px] text-(--text-color) hover:underline truncate"
                        >
                            {comment.user?.name}
                        </Link>
                        <span className="text-(--secondary-text) text-[13px]">
                            @{comment.user?.username}
                        </span>
                        <span className="text-[11px] text-(--secondary-text) shrink-0">
                            • {useTimeAgo(comment.createdAt)}
                        </span>
                    </div>


                    {/* DOTS MENU - Only for owner */}
                    {isOwner && (

                        <div className="relative">

                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 hover:bg-(--hover) rounded-lg transition-colors text-(--secondary-text) cursor-pointer"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {showMenu && (
                                <div className="px-2 py-2 absolute right-0 mt-1 w-36 bg-(--bg-color) border border-(--input-border) rounded-lg shadow-xl z-50 overflow-hidden">

                                    <button
                                        className="flex items-center rounded-lg cursor-pointer gap-2 w-full px-4 py-2 text-sm text-(--text-color) hover:bg-(--hover) transition-colors"
                                        onClick={() => {
                                            onEditClick(comment?.id, comment.content);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>

                                    <button
                                        className="flex items-center rounded-lg cursor-pointer gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                        onClick={() => {
                                            deleteComment(comment?.id);
                                            setShowMenu(false);
                                            onCommentDeleted();
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>

                                </div>
                            )}
                        </div>
                    )}
                </div>


                <p className="text-[14px] text-(--text-color)/90 leading-relaxed wrap-break-word">
                    {comment.content}
                </p>


            </div>
        </div>
    );
};

export default CommentItem;
