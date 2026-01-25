"use client";


import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { showToast } from "@/utils/showToast";
import { Eye, EyeOff, Loader, Star } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {


    const [loginFormData, setLoginFormData] = useState({
        email: "",
        password: ""
    });

    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";


    const { isLoading } = useAuthStore();


    // HANDLE INPUT CHANGE
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
    }


    // HANDLE FORM SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {

            if (loginFormData.email === "" || loginFormData.password === "") {
                return showToast({ type: "error", message: "Both fields are required." });
            }

            const success = await useAuthStore.getState().login(loginFormData);

            if (success) {
                await useAuthStore.getState().checkAuth();
                router.push("/home");
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

                    <h2 className="text-4xl font-bold mb-6">Welcome back.</h2>


                    {/* Form */}
                    <form className="w-full space-y-3" onSubmit={handleSubmit} autoComplete="true">


                        {/* Google */}
                        <button className="w-full social-btn">
                            <Image
                                src={`${theme === "light" ? "/twitterlight.svg" : "/twitterdark.svg"}`}
                                width={20}
                                height={20}
                                alt="X"
                            />
                            <span>Sign in with Twitter</span>
                        </button>

                        {/* Twitter */}
                        <button className="w-full social-btn">
                            <Image
                                src="/google.svg"
                                width={20}
                                height={20}
                                alt="Google"
                            />
                            <span>Sign in with Google</span>
                        </button>


                        {/* OR */}
                        <div className="flex items-center my-4">
                            <div className="flex-1 h-px bg-gray-700" />
                            <span className="px-2 text-sm text-gray-400">OR</span>
                            <div className="flex-1 h-px bg-gray-700" />
                        </div>

                        {/* EMail and password */}
                        <input
                            name="email"
                            type="email"
                            maxLength={50}
                            placeholder="Enter Email"
                            className="input"
                            value={loginFormData.email}
                            onChange={handleInput}
                        />

                        <div className="relative w-full">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                maxLength={50}
                                placeholder="Enter Password"
                                className="input pr-10"
                                value={loginFormData.password}
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


                        <div className="mt-6 flex flex-col">
                            <div className="flex items-center gap-2">
                                <Star size={15} color="var(--button-bg)" />
                                <p className="">Forgot  password? <Link
                                    href="/forgot-password"
                                    className="text-(--button-bg) cursor-pointer"
                                >Forgot password</Link></p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Star size={15} color="var(--button-bg)" />
                                <p className="">Don't have an account? <Link
                                    href="/signup"
                                    className="text-(--button-bg) cursor-pointer"
                                >Signup</Link></p>
                            </div>
                        </div>


                        <button className="w-full mb-3 primary-btn" onClick={handleSubmit}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                    </form>

                </div>

            </div>

        </main>

    </>);
}

export default LoginPage