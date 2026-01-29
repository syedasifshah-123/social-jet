"use client";
import { useProfileStore } from "@/stores/profileStore";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Camera, Loader } from "lucide-react"; // Icon ke liye
import { useAuthStore } from "@/stores/authStore";
import { s } from "framer-motion/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/showToast";

const EditProfilePage = () => {


    // current user and user profile
    const { user: currentUser } = useAuthStore();
    const { getUserProfile, userProfile, isLoading } = useProfileStore();


    // set the user profile
    useEffect(() => {
        getUserProfile(currentUser?.username as string);
    }, []);


    // Name and bio state
    const [name, setName] = useState<string>(userProfile?.name || "");
    const [bio, setBio] = useState<string>(userProfile?.profile?.bio || "");

    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    // Initial state mein userProfile ka data set karein
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);



    // Iniitially load the user profile
    useEffect(() => {
        if (userProfile?.profile?.banner) setBannerPreview(userProfile.profile.banner);
        if (userProfile?.profile?.avatar) setAvatarPreview(userProfile.profile.avatar);
    }, [userProfile]);



    // handle avatar change
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };



    // handle banner change
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };


    const router = useRouter();

    // handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            const formData = new FormData();

            formData.append("name", name);
            formData.append("bio", bio);
            if (avatarFile) formData.append("avatar", avatarFile);
            if (bannerFile) formData.append("banner_img", bannerFile);

            const success = await useProfileStore.getState().createProfile(formData);
            if (success) {
                await useAuthStore.getState().checkAuth();
                showToast({ type: "success", message: "Profile updated successfully" });
                router.replace("/home");
            } else {
                return;
            }

        } catch (error) {
            throw error;
        }
    }


    return (

        <form className="px-5 py-5 max-w-2xl mx-auto" onSubmit={handleSubmit}>
            <h1 className="text-[22px] font-medium">Edit Profile</h1>

            {/* --- BANNER SECTION --- */}
            <div className="mt-8 relative h-48 w-full bg-neutral-800 rounded-xl overflow-visible group">
                {bannerPreview && (
                    <Image src={bannerPreview} alt="Banner" fill className="object-cover rounded-xl opacity-80" />
                )}

                {/* Glassmorphism Overlay for Banner */}
                <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
                >
                    <div className="p-3 bg-gray-900/60 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-gray-900/80 transition shadow-lg">
                        <Camera size={24} />
                    </div>
                </div>

                <input ref={bannerInputRef} type="file" hidden accept="image/*" onChange={handleBannerChange} />

                {/* --- AVATAR SECTION --- */}
                <div className="absolute -bottom-16 left-6 h-32 w-32 rounded-full border-4 border-(--bg-color) bg-neutral-700 overflow-hidden group/avatar shadow-xl">
                    {avatarPreview && (
                        <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    )}

                    {/* Glassmorphism Overlay for Avatar */}
                    <div
                        onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                    >
                        <div className="p-2.5 bg-gray-900/60 backdrop-blur-md rounded-full border border-white/20 text-white shadow-lg">
                            <Camera size={20} />
                        </div>
                    </div>

                    <input ref={avatarInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </div>
            </div>

            <div className="mt-20">


                <p className="font-normal mb-2">Name</p>

                <input
                    name="name"
                    type="text"
                    maxLength={50}
                    placeholder="Enter Name"
                    className="input"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />

                {/* NAME & BIO */}
                <div className="mt-5">

                    <p className="font-normal mb-2">Bio</p>
                    <textarea
                        name="bio"
                        className="h-25 max-h-37.5 min-h-25 input"
                        placeholder="Enter bio"
                        value={bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    />
                </div>

            </div>

            <div className="mt-5">
                <button className="primary-btn w-full" onClick={handleSubmit}>
                    {isLoading ? <Loader className="animate-spin duration-100 mx-auto" color="black" /> : "Update Profile"}
                </button>
            </div>

        </form>
    );
}

export default EditProfilePage;