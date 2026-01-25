"use client";


import ResetPasswordOTP from "@/components/auth/ResetPasswordOtp";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { ForgotPassworFormType } from "@/types/authTypes";
import { showToast } from "@/utils/showToast";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ForgotPage = () => {

    // const router = useRouter();
    const [email, setEmail] = useState<string>("");

    const [currentStep, setCurrentStep] = useState<number>(1);

    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";



    const { isLoading, forgotPassword } = useAuthStore();


    // handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            const formData: ForgotPassworFormType = {
                email
            }

            if (email === "") {
                return showToast({ type: "error", message: "Enter valid email" });
            }

            const success = await forgotPassword(formData);

            if (success) {
                setCurrentStep(2);
            }

        } catch (error) {
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

                    <h2 className="text-4xl font-bold mb-6">
                        {currentStep === 1 && "Forgot password."}
                        {currentStep === 2 && "Verify OTP."}
                    </h2>


                    {/* Form */}
                    {currentStep === 1 && (<form className="w-full space-y-4" onSubmit={handleSubmit}>


                        <p className="opacity-70 font-normal"> First, enter your registered email and verify the OTP sent to it.
                            Once verified, you can safely set a new password for your account.</p>

                        <input
                            name="email"
                            type="email"
                            maxLength={50}
                            placeholder="Enter Email"
                            className="input"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        />

                        <button className="w-full primary-btn" onClick={handleSubmit}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </button>

                    </form>)}


                    {/* Veriy OTP */}
                    {currentStep === 2 && <ResetPasswordOTP email={email} />}


                </div>

            </div>

        </main>

    </>);
}

export default ForgotPage;