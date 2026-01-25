import { useState } from "react";

type ProfileStep1Props = {
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
};


// gender
const genders = ["Male", "Female", "Other"];


// Birth Date
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const dates = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 2026 - 1906 + 1 }, (_, i) => 2026 - i);


const ProfileStep1 = ({ setCurrentStep }: ProfileStep1Props) => {


    // Profile Data
    const [gender, setGender] = useState<string>("");

    const [month, setMonth] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [year, setYear] = useState<string>("");

    return (<>

        <form className="flex flex-col space-y-3">

            {/* Gender */}
            <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input"
            >
                <option value="" className="text-black">Gender</option>
                {genders.map((g) => (
                    <option key={g} value={g.toLowerCase()} className="text-black">{g}</option>
                ))}
            </select>


            {/* Country */}
            <input
                id="country"
                type="text"
                maxLength={50}
                placeholder="Enter Country"
                className="input"
            />


            {/* Location */}
            <input
                id="location"
                type="text"
                maxLength={50}
                placeholder="Enter Location"
                className="input"
            />


            {/* Date of birth */}
            <p className="font-medium">Date of birth</p>
            <p className="opacity-70 font-normal">This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.</p>

            {/* Date of birth */}
            <div className="flex gap-3">
                {/* MONTH */}
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

                {/* DATE */}
                <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                >
                    <option value="">Date</option>
                    {dates.map((d) => (
                        <option key={d} value={d} className="text-black">{d}</option>
                    ))}
                </select>

                {/* YEAR */}
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="input"
                >
                    <option value="">Year</option>
                    {years.map((y) => (
                        <option key={y} value={y} className="text-black">{y}</option>
                    ))}
                </select>
            </div>


            <div className="mt-3 flex flex-col gap-2">
                {/* Next button */}
                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setCurrentStep(4)}
                >
                    Next
                </button>


                {/* Skip button */}
                <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setCurrentStep(4)}
                >
                    May be later
                </button>
            </div>


        </form>

    </>);
}

export default ProfileStep1;