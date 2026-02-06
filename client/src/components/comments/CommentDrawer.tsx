"use client";


import { motion, AnimatePresence } from 'framer-motion';
import CommentArea from './CommentArea';



interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded: () => void;
    onCommentDeleted: () => void;
}



const CommentDrawer = ({ isOpen, onClose, postId, onCommentAdded, onCommentDeleted }: CommentDrawerProps) => {


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


                        <CommentArea
                            isOpen={isOpen}
                            onClose={onClose}
                            onCommentAdded={onCommentAdded}
                            onCommentDeleted={onCommentDeleted}
                            postId={postId}
                        />


                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default CommentDrawer;
