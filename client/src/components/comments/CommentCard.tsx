import { Loader, MessageCircle } from "lucide-react";
import CommentItem from "./CommentItem";
import { useCommentStore } from "@/stores/commentStore";




interface CommentCardProps {
    onCommentDeleted: () => void;
    onEditClick: (id: string, content: string) => void;
}


const CommentCard = ({ onCommentDeleted, onEditClick }: CommentCardProps) => {

    const { comments, isLoading } = useCommentStore();

    // Loading State
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader className="animate-spin" color="var(--button-bg)" />
            </div>
        );
    }

    //  Empty State
    if (comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <MessageCircle size={40} className="mb-2" />
                <p className="text-sm font-medium">No comments yet</p>
            </div>
        );
    }

    // 3. Data State
    return (

        <div className="flex flex-col">
            {comments.map((comment, index) => (
                <CommentItem
                    key={comment.id || index}
                    comment={comment}
                    isFirst={index === 0}
                    onCommentDeleted={onCommentDeleted}
                    onEditClick={onEditClick}
                />
            ))}
        </div>
    );
};

export default CommentCard;
