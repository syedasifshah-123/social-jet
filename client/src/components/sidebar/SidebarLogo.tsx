import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

const SidebarLogo = () => {

    const { theme } = useTheme();
    const logoSrc = theme === "dark" ? "/lightlogo.svg" : "/darklogo.svg";

    return (<>

        <div className="w-7.5 h-7.5 mt-5 mb-8 ms-2 sm:ml-4">
            <Image
                src={logoSrc}
                className=""
                alt="App Logo"
                width={40}
                height={40}
                priority
            />
        </div>

    </>);
}

export default SidebarLogo;