import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

const AuthLeftSide: React.FC = () => {

    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";

    return (

        <div className="hidden md:flex w-1/2 items-center justify-center">
            <Image
                src={logoSrc}
                alt="App Logo"
                width={320}
                height={320}
                priority
            />
        </div>

    );
}

export default AuthLeftSide