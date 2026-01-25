"use client";


import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "@/config/axios";
import { Loader } from "lucide-react";
import { SignupFormType } from "@/types/authTypes";
import { useAuthStore } from "@/stores/authStore";
import { showToast } from "@/utils/showToast";


const SignupPage = () => {

    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [status, setStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");

    const { isLoading } = useAuthStore();

    const [signupFormData, setSignupFormData] = useState<SignupFormType>({
        name: "",
        email: "",
        username: "",
        password: ""
    });



    // HANDLING INPUT CHANGE
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSignupFormData({
            ...signupFormData,
            [e.target.name]: e.target.value
        })
    }


    // DEBOUCE AND CHECK USERNAME
    useEffect(() => {
        if (!signupFormData.username || signupFormData.username.length < 3) {
            setStatus("idle");
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setStatus("checking");

                const res = await api.post("/auth/check-username", {
                    username: signupFormData.username,
                });

                setStatus(res.data.exists ? "taken" : "available");
            } catch (err) {
                setStatus("idle");
            }
        }, 600); // debounce

        return () => clearTimeout(timeout);
    }, [signupFormData.username]);



    // FORM SUBMISSION
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            if (signupFormData.name === "" || signupFormData.email === "" || signupFormData.username === "" || signupFormData.password === "") {
                return showToast({ type: "error", message: "All fields are required." });
            }

            const success = await useAuthStore.getState().signup(signupFormData);

            if (success) {
                router.push(`/verify-otp?email=${encodeURIComponent(signupFormData.email)}`);
            };

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
                        {currentStep === 1 && "Create Account."}
                        {currentStep === 2 && "Verify OTP."}
                        {currentStep === 3 && "Create Profile."}
                        {currentStep === 4 && "Create Profile."}
                    </h2>


                    {/* Step 1 */}
                    {/* Register Form */}
                    {currentStep === 1 && (<form className="flex flex-col gap-3" onSubmit={handleSubmit}>

                        <input
                            name="name"
                            type="text"
                            maxLength={50}
                            value={signupFormData.name}
                            onChange={handleInputChange}
                            placeholder="Enter Name"
                            className="input"
                            autoComplete="true"
                        />

                        <input
                            name="email"
                            type="text"
                            maxLength={50}
                            value={signupFormData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Email"
                            className="input"
                            autoComplete="true"
                        />

                        <div className="flex flex-col gap-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                maxLength={50}
                                placeholder="Enter Username"
                                className="input"
                                value={signupFormData.username}
                                onChange={handleInputChange}
                                autoComplete="true"
                            />

                            {status === "checking" && (
                                <p className="text-sm text-gray-500">Checking username…</p>
                            )}

                            {status === "taken" && (
                                <p className="text-sm text-red-500">Username is already taken</p>
                            )}

                            {status === "available" && (
                                <p className="text-sm text-green-500">Username is available</p>
                            )}
                        </div>

                        <div className="relative w-full">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                maxLength={50}
                                value={signupFormData.password}
                                onChange={handleInputChange}
                                placeholder="Enter Password"
                                className="input pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <p className="mt-5">Already have account? <span
                            onClick={() => router.push("/login")}
                            className="text-(--button-bg) cursor-pointer"
                        >Login</span></p>

                        <button className="mb-3 primary-btn" onClick={handleSubmit}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                                </>
                            ) : (
                                "Register"
                            )}
                        </button>

                    </form>)}


                </div>
            </div>

        </main>

    </>);
}

export default SignupPage;