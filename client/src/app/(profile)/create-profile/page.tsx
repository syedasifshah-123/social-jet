"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { showToast } from "@/utils/showToast";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Gender options
const genders = ["Male", "Female", "Other"];

// Months for DOB
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Dates and years
const dates = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 2026 - 1906 + 1 }, (_, i) => 2026 - i);

const CreateProfile = () => {


    const router = useRouter();
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";

    const [currentStep, setCurrentStep] = useState<number>(1);

    // Profile Data
    const [profileData, setProfileData] = useState({
        gender: "",
        country: "",
        location: "",
        birthdate: "",
        bio: "",
    });

    // Individual DOB states
    const [month, setMonth] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [year, setYear] = useState<string>("");


    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);


    // Input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle Next button
    const handleNextStep = () => {

        // Format DOB as dd/mm/yyyy
        const dob = date && month && year
            ? `${date.toString().padStart(2, "0")}/${(months.indexOf(month) + 1).toString().padStart(2, "0")}/${year}`
            : "";

        const finalProfileData = {
            ...profileData,
            birthdate: dob,
        };

        setCurrentStep(2);
    };



    // Avatar handler update karein
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file); // ASLI FILE save karein
        setAvatarPreview(URL.createObjectURL(file)); // Sirf dikhane ke liye URL
    };



    // Banner handler update karein
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };


    const { isLoading } = useProfileStore();



    // HANDLE FORM SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            const formData: FormData = new FormData();

            formData.append("gender", profileData.gender);
            formData.append("country", profileData.country);
            formData.append("location", profileData.location);
            formData.append("bio", profileData.bio);
            formData.append("birthdate", `${date}/${month}/${year}`);
            if (avatarFile) formData.append("avatar", avatarFile);
            if (bannerFile) formData.append("banner_img", bannerFile);

            const success = await useProfileStore.getState().createProfile(formData);

            if (success) {
                await useAuthStore.getState().checkAuth();
                showToast({ type: "success", message: "Profile created scuccessfull!" });
                router.push("/home");
            } else {
                return;
            }

        } catch (error) {
            throw error;
        }

    }


    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full md:w-1/2 flex items-center justify-center px-8">
                <div className="max-w-112.5 w-full">

                    {/* Logo */}
                    <Image
                        src={logoSrc}
                        className="mx-auto my-10"
                        alt="App Logo"
                        width={40}
                        height={40}
                        priority
                    />

                    <h2 className="text-4xl font-bold mb-6">Create Profile</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1 */}
                        {currentStep === 1 && (
                            <div className="flex flex-col space-y-3">
                                {/* Gender */}
                                <select
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                    name="gender"
                                    className="input"
                                >
                                    <option value="" className="text-black">Gender</option>
                                    {genders.map((g) => (
                                        <option key={g} value={g.toLowerCase()} className="text-black">{g}</option>
                                    ))}
                                </select>

                                {/* Country */}
                                <input
                                    name="country"
                                    type="text"
                                    maxLength={50}
                                    placeholder="Enter Country"
                                    className="input"
                                    value={profileData.country}
                                    onChange={handleInputChange}
                                />

                                {/* Location */}
                                <input
                                    name="location"
                                    type="text"
                                    maxLength={50}
                                    placeholder="Enter Location"
                                    className="input"
                                    value={profileData.location}
                                    onChange={handleInputChange}
                                />

                                {/* Date of birth */}
                                <p className="font-medium">Date of birth</p>
                                <p className="opacity-70 font-normal">
                                    This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
                                </p>

                                <div className="flex gap-3">
                                    {/* Month */}
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="input"
                                    >
                                        <option value="" className="text-black">Month</option>
                                        {months.map((m) => (
                                            <option key={m} value={m} className="text-black">{m}</option>
                                        ))}
                                    </select>

                                    {/* Date */}
                                    <select
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="input"
                                    >
                                        <option value="" className="text-black">Date</option>
                                        {dates.map((d) => (
                                            <option key={d} value={d} className="text-black">{d}</option>
                                        ))}
                                    </select>

                                    {/* Year */}
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="input"
                                    >
                                        <option value="" className="text-black">Year</option>
                                        {years.map((y) => (
                                            <option key={y} value={y} className="text-black">{y}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Buttons */}
                                <div className="mt-3 flex flex-col gap-2">
                                    <button
                                        type="button"
                                        className="primary-btn"
                                        onClick={handleNextStep}
                                    >
                                        Next
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => router.push("/home")}
                                    >
                                        May be later
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {currentStep === 2 && <div className="flex flex-col space-y-3">

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
                                    name="banner_img"
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
                                        name="avatar"
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
                                    value={profileData.bio}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button className="h-11.25 primary-btn" onClick={handleSubmit}>
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                                    </>
                                ) : (
                                    "Create Profile"
                                )}
                            </button>

                        </div>}
                    </form>

                </div>
            </div>
        </main>
    );
};

export default CreateProfile;
