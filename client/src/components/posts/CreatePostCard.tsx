import { ImagePlus, Loader, Smile, X } from "lucide-react";
import { useRef, useState } from "react";
import { showToast } from "@/utils/showToast";
import { usePostStore } from "@/stores/postStore";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import Avatar from "../Avatar";
import { useModalContext } from "@/context/ModalContext";



const CreatePostCard = () => {

    const { user } = useAuthStore();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [postContent, setPostContent] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // profile state
    const { isLoading } = usePostStore();
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const { theme } = useTheme();

    const textarea = textareaRef.current;

    const { closeModal } = useModalContext();


    // handle input with height
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
        setPostContent(e.target.value);
    };



    // handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };



    // remove preview image
    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    // handle post creation
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            if (!postContent && !selectedFile) return showToast({ type: "error", message: "Enter something cool." });

            const formData = new FormData();
            formData.append("content", postContent);

            if (selectedFile) {
                formData.append("media", selectedFile);
            }

            const success = await usePostStore.getState().createPost(formData)

            if (success) {
                
                closeModal();
                setPostContent("");
                setSelectedFile(null);
                setPreviewUrl(null);

                if (textarea) {
                    textarea.style.height = "auto";
                }

            } else {
                return;
            }

        } catch (error) {
            throw error;
        }
    }

    return (<>

        {/* Post creation */}
        <div className="flex gap-3 px-4 py-4 border-b border-(--input-border)">

            <div className="w-10 h-10 object-cover shrink-0">
                <Avatar userAvatar={user?.avatar} />
            </div>

            <form className="flex-1" onSubmit={handleCreatePost}>

                <textarea
                    ref={textareaRef}
                    placeholder="What’s happening?"
                    className="w-full bg-transparent resize-none outline-none text-lg placeholder:text-neutral-500 overflow-y-auto max-h-50"
                    value={postContent}
                    onChange={handleInput}
                    rows={2}
                />

                {previewUrl && (
                    <div className="relative my-3 w-full max-h-100 overflow-hidden rounded-2xl border border-gray-700">
                        <button
                            onClick={removeImage}
                            className="absolute top-2 left-2 bg-gray-900/80 p-1 rounded-full hover:bg-gray-800"
                        >
                            <X size={20} className="text-white" />
                        </button>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">

                    <div className="flex items-center text-blue-500">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-400 cursor-pointer hover:bg-blue-400/10 p-2 rounded-full transition"
                        >
                            <ImagePlus size={22} />
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>


                        {/* <Sparkles className="w-5 h-5 cursor-pointer" /> */}


                        {/* Emoji picker icon */}
                        <div className="flex items-center justify-between">

                            {/* EMOJI WRAPPER */}
                            <div className="relative text-blue-400 cursor-pointer hover:bg-blue-400/10 p-2 rounded-full transition">
                                <Smile
                                    className="w-5 h-5"
                                    onClick={() => setShowEmoji((prev) => !prev)}
                                />

                                {showEmoji && (
                                    <div className="absolute top-8 left-0 z-50">
                                        <EmojiPicker
                                            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                                            onEmojiClick={(emojiData) => {
                                                setPostContent((prev) => prev + emojiData.emoji);
                                                setShowEmoji(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <button className="surface-btn cursor-pointer" onClick={handleCreatePost}>
                        {isLoading ? <Loader className="animate-spin duration-1000 mx-auto" color="var(--bg-color)" /> : "Post"}
                    </button>

                </div>

            </form>

        </div>

    </>);
}

export default CreatePostCard;