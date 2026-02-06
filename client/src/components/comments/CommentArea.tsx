"use client";


import { useCommentStore } from "@/stores/commentStore";
import { showToast } from "@/utils/showToast";
import { Edit, Loader, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import CommentCard from "./CommentCard";



interface CommentAreProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}


const CommentArea = ({ isOpen, onClose, postId, onCommentAdded, onCommentDeleted }: CommentAreProps) => {


    // get comments
    const { isLoading, getComments, commentsCount, postComment, isCommentPosting, editComment } = useCommentStore();

    useEffect(() => {
        if (isOpen && postId) {
            getComments(postId);
        }
    }, [isOpen, postId, getComments]);


    // comment content state
    const [commentContent, setCommentContent] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);


    // Edit mode activate karne ka function
    const handleEditClick = (id: string, content: string) => {
        setEditingCommentId(id);
        setCommentContent(content);
    };



    // comment submit
    const handleSubmit = async () => {

        if (commentContent === "") {
            showToast({ type: "error", message: "Enter comment!" });
            return;
        }

        try {

            if (editingCommentId) {

                editComment(editingCommentId, commentContent);
                setEditingCommentId(null);
                setCommentContent("");

            } else {

                await postComment(postId, commentContent);
                setCommentContent("");
                onCommentAdded();

            }

        } catch (err) {
            throw err;
        }
    }

    return (<>

        {/* Header */}
        <div className="flex items-center justify-between cursor-default mb-5 px-5 pt-3">

            <h2 className="text-xl font-bold text-(--text-color)">{commentsCount}
                {commentsCount > 1 || commentsCount == 0 ? " Comments" : " Comment"}
            </h2>

            <button
                onClick={onClose}
                className="p-2 hover:bg-(--hover)/40 rounded-full transition-colors cursor-pointer"
            >
                <X size={24} />
            </button>

        </div>


        {/* Input */}
        <div className="flex items-center gap-2 max-sm:flex max-sm:flex-col px-5 mb-3">

            <input
                type="text"
                placeholder='Post your comment'
                className='input'
                name='content'
                autoComplete='off'
                value={commentContent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentContent(e.target.value)}
            />

            <button className='primary-btn px-3 rounded-lg max-sm:w-full'
                onClick={handleSubmit}
            >
                {isCommentPosting ? <Loader className='animate-spin' color='var(--bg-color)' /> : editingCommentId ? <Edit color='var(--bg-color)' className='max-sm:mx-auto' /> : <Send color='var(--bg-color)' className='max-sm:mx-auto' />}
            </button>

        </div>


        {/* Comments area */}
        <div className="overflow-y-auto h-[calc(100vh-200px)] custom-scrollbar mt-4">
            {isLoading ?(
                <Loader className="animate-spin mx-auto mt-10" color="var(--button-bg)"/>
            ) : (
                <CommentCard
                    onCommentDeleted={onCommentDeleted}
                    onEditClick={handleEditClick}
                />
            )}
        </div>

    </>);
}

export default CommentArea;