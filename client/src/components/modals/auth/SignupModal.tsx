"use client";

import { useState } from "react";

const SignupModal = () => {
    const [step, setStep] = useState(1);

    return (
        <>
            {step === 1 && (
                <>
                    <h2 className="text-2xl font-bold mb-4">
                        Create your account
                    </h2>

                    <input className="input" placeholder="Name" />
                    <input className="input mt-3" placeholder="Email" />

                    <button
                        className="btn-primary mt-6"
                        onClick={() => setStep(2)}
                    >
                        Next
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-2xl font-bold mb-4">
                        Date of birth
                    </h2>

                    <div className="flex gap-2">
                        <select className="select">Month</select>
                        <select className="select">Day</select>
                        <select className="select">Year</select>
                    </div>

                    <button
                        className="btn-primary mt-6"
                        onClick={() => setStep(3)}
                    >
                        Next
                    </button>
                </>
            )}

            {step === 3 && (
                <>
                    <h2 className="text-2xl font-bold mb-4">
                        Finish signup
                    </h2>

                    <button className="btn-primary w-full">
                        Create account
                    </button>
                </>
            )}
        </>
    );
};

export default SignupModal;
