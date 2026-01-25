"use client";

import AuthLeftSide from "@/components/auth/AuthLeftSide";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useRouter } from "next/navigation";


const HomePage = () => {


    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    return (<>

        <main className="min-h-screen flex">

            {/* LEFT SIDE */}
            <AuthLeftSide />


            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-8">
                <div className="max-w-sm w-full">

                    <h2 className="text-4xl font-bold mb-6">Join today.</h2>

                    {/* Google */}
                    <button className="w-full social-btn">
                        <Image
                            src={`${theme === "light" ? "/twitterlight.svg" : "/twitterdark.svg"}`}
                            width={20}
                            height={20}
                            alt="X"
                        />
                        <span>Sign up with Twitter</span>
                    </button>

                    {/* Twitter */}
                    <button className="w-full social-btn">
                        <Image
                            src="/google.svg"
                            width={20}
                            height={20}
                            alt="Google"
                        />
                        <span>Sign up with Google</span>
                    </button>


                    {/* OR */}
                    <div className="flex items-center my-4">
                        <div className="flex-1 h-px bg-gray-700" />
                        <span className="px-2 text-sm text-gray-400">OR</span>
                        <div className="flex-1 h-px bg-gray-700" />
                    </div>

                    {/* Create account */}
                    <button className="w-full mb-3 primary-btn"
                        onClick={() => router.push("/signup")}
                    >
                        Create account
                    </button>

                    <p className="text-xs text-gray-400 mb-6">
                        By signing up, you agree to the{" "}
                        <span className="text-(--button-bg)">Terms of Service</span> and{" "}
                        <span className="text-(--button-bg)">Privacy Policy</span>, including{" "}
                        <span className="text-(--button-bg)">Cookie Use</span>.
                    </p>

                    <h3 className="font-bold mb-3">Already have an account?</h3>

                    <div className="flex flex-col gap-2">
                        <button className="w-full secondary-btn" onClick={() => router.push("/login")}>
                            Sign in
                        </button>

                        <button className="w-full secondary-btn" onClick={toggleTheme}>
                            Get Hired Me
                        </button>
                    </div>

                </div>
            </div>
        </main>


    </>);
}


export default HomePage;