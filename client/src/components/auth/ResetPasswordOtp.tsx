import { useAuthStore } from "@/stores/authStore";
import { ForgotPassworOtpFormType } from "@/types/authTypes";
import { showToast } from "@/utils/showToast";
import { Loader } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";


interface ResetPasswordOTPProps {
    email: string;
}


const ResetPasswordOTP = ({ email }: ResetPasswordOTPProps) => {


    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);


    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };


    // handle paste
    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedData = e.clipboardData.getData("Text").trim().slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("");
        setOtp((prev) => {
            const updated = [...prev];
            for (let i = 0; i < newOtp.length; i++) updated[i] = newOtp[i];
            return updated;
        });

        // Focus last filled input
        const lastIndex = newOtp.length - 1;
        otpRefs.current[lastIndex]?.focus();
    };



    const otpFormData: ForgotPassworOtpFormType = {
        email,
        otp: otp.join("")
    }


    const { isLoading } = useAuthStore();

    // handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            if (otpFormData.otp === "") {
                return showToast({ type: "error", message: "Enter valid OTP" });
            }

            const success = await useAuthStore.getState().verifyForgotPasswordOtp(otpFormData);
            
            if (success) {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                return null;
            }

        } catch (error) {
            console.error("OTP Verification failed:", error);
            throw error;
        }
    }


    return (<>

        <form className="w-full space-y-3" onSubmit={handleSubmit}>

            <p className="text-normal opacity-70 mb-4">
                Enter the 6-digit code sent to <strong>email</strong>
            </p>

            {/* 6 OTP Input Boxes */}
            <div className="flex justify-center gap-2 max-w-md">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            otpRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-17 h-17 max-md:w-14 max-md:h-14  text-center text-xl font-semibold input"
                        onPaste={handleOtpPaste}
                    />
                ))}
            </div>


            <button className="w-full h-11.25 mt-2 primary-btn" type="button" onClick={handleSubmit}>
                {isLoading ? (
                    <>
                        <Loader className="animate-spin duration-1000 mx-auto" color="black" />
                    </>
                ) : (
                    "Verify OTP"
                )}
            </button>

            {/* Resend OTP */}
            <p className="text-normal opacity-70">
                Didn't receive code?{" "}
                <button
                    className="text-(--primary) underline hover:opacity-80 cursor-pointer"
                >
                    Resend
                </button>
            </p>

        </form>

    </>);
}

export default ResetPasswordOTP;