"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";


type ModalContextType = {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
    modalContent: ReactNode | null;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {

    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
    };


    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <ModalContext.Provider
            value={{ openModal, closeModal, modalContent }}
        >
            {children}

            {/* GLOBAL MODAL */}
            <AnimatePresence>
                {modalContent && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-(--input-border)/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-(--bg-color) rounded-lg relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                            {modalContent}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error(
            "useModalContext must be used inside ModalProvider"
        );
    }
    return context;
};
