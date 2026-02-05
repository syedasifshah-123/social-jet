"use client";


import { useCommentStore } from '@/stores/commentStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Loader, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import CommentCard from './CommentCard';
import { showToast } from '@/utils/showToast';



interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}



const CommentDrawer = ({ isOpen, onClose, postId, onCommentAdded, onCommentDeleted }: CommentDrawerProps) => {


    // get comments
    const { getComments, commentsCount, postComment, isCommentPosting, editComment } = useCommentStore();

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

    return (

        <AnimatePresence>
            {isOpen && (
                <>

                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm cursor-default"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                        className="fixed flex flex-col right-0 top-0 h-full w-full max-w-lg bg-(--bg-color) shadow-2xl z-50 border-l border-(--input-border)"
                    >


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
                                placeholder='Enter comment'
                                className='input'
                                name='content'
                                autoComplete='off'
                                value={commentContent}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentContent(e.target.value)}
                            />

                            <button className='primary-btn px-3 rounded-lg max-sm:w-full'
                                onClick={handleSubmit}
                            >
                                {isCommentPosting ? <Loader className='animate-spin' color='var(--bg-color)' /> : editingCommentId ? <Edit color='var(--bg-color)' className='max-sm:mx-auto'/>  : <Send color='var(--bg-color)' className='max-sm:mx-auto' /> }
                            </button>

                        </div>


                        {/* Comments area */}
                        <div className="overflow-y-auto h-[calc(100vh-200px)] custom-scrollbar mt-4">
                            <CommentCard
                                onCommentDeleted={onCommentDeleted}
                                onEditClick={handleEditClick}
                            />
                        </div>


                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default CommentDrawer;
