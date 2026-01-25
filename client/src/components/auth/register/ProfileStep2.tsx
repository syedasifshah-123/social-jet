import Image from "next/image";
import { useRef, useState } from "react";

const ProfileStep2 = () => {


    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // banner handler
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setBannerPreview(url);
    };

    // avatar handler
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    return (<>

        <form className="flex flex-col space-y-3">

            {/* BANNER */}
            <div
                onClick={() => bannerInputRef.current?.click()}
                className="relative h-27.5 w-full border-2 border-dashed border-gray-400 rounded-lg cursor-pointer flex items-center justify-center"
            >
                {bannerPreview ? (
                    <Image
                        src={bannerPreview}
                        alt="Banner"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <p className="text-gray-500">Upload banner</p>
                )}

                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleBannerChange}
                />

                {/* AVATAR */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        avatarInputRef.current?.click();
                    }}
                    className={`absolute -bottom-10 left-8 h-25 w-25 rounded-full border-2 border-dashed border-gray-400 cursor-pointer overflow-hidden flex items-center justify-center
            ${!avatarPreview ? "bg-gray-200" : ""}`}>
                    {avatarPreview ? (
                        <Image
                            src={avatarPreview}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <p className="text-sm text-gray-500">Avatar</p>
                    )}

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                    />

                </div>
            </div>

            {/* BIO */}
            <div className="mt-8">
                <p className="font-normal mb-2">Bio</p>
                <textarea
                    name="bio"
                    className="h-25 max-h-37.5 min-h-25 input"
                    placeholder="Enter bio"
                />
            </div>

            <button className="h-11.25 primary-btn">Register</button>
        </form>

    </>);
}

export default ProfileStep2;