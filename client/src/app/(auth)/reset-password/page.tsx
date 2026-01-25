"use client";


import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/utils/showToast";

const ResetPassword = () => {


    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";


    // form data state
    const [formData, setFormData] = useState({
        email: email,
        newPassword: "",
        confirmPassword: ""
    });



    // handle input change
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }



    const { isLoading } = useAuthStore();


    // handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {


            if (formData.newPassword === "" || formData.confirmPassword === "") {
                return showToast({ type: "error", message: "Both fields are required." });
            }

            if (formData.newPassword.length < 6) {
                return showToast({ type: "error", message: "Password must be at least 6 characters long." });
            }

            if (formData.confirmPassword !== formData.newPassword) {
                return showToast({ type: "error", message: "Invalid confirm password" });
            }

            const success = await useAuthStore.getState().confirmResetPassword(formData);
            if (success) {
                router.push('/home');
            } else {
                return null;
            }

        } catch (error) {
            console.error("OTP Verification failed:", error);
            throw error;
        }
    }


    return (<>

        <main className="min-h-screen flex items-center justify-center">


            <div className="w-full md:w-1/2 flex items-center justify-center px-8">
                <div className="max-w-112.5 w-full">

                    <Image
                        src={logoSrc}
                        className="mx-auto my-10"
                        alt="App Logo"
                        width={40}
                        height={40}
                        priority
                    />

                    <h2 className="text-4xl font-bold mb-6">Reset password.</h2>


                    {/* Form */}
                    <form className="w-full space-y-4" onSubmit={handleSubmit}>


                        <p className="opacity-70 font-normal">Make sure your new password is strong and secure to keep your account protected.</p>

                        <div className="relative w-full">
                            <input
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                maxLength={50}
                                placeholder="Enter Password"
                                className="input pr-10"
                                value={formData.newPassword}
                                onChange={handleInput}
                            />
                            <button
                                type="button"
                                className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>


                        <div className="relative w-full">
                            <input
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                maxLength={50}
                                placeholder="Confirm password"
                                className="input pr-10"
                                value={formData.confirmPassword}
                                onChange={handleInput}
                            />
                            <button
                                type="button"
                                className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button className="w-full primary-btn" onClick={handleSubmit}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>

                    </form>

                </div>

            </div>

        </main>

    </>);
}

export default ResetPassword;