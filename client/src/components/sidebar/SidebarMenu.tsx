import { ComponentType } from "react";
import {
    Home,
    Search,
    Bell,
    UserPlus,
    MessageCircle,
    Bookmark,
    User,
    MoreHorizontal,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


type IconType = ComponentType<{ className?: string }>;

type MenuItems = {
    label: string;
    icon: IconType;
    dot?: boolean;
    path: string;
}


const menuItems: MenuItems[] = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Explore", icon: Search, path: "/explore" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Follow", icon: UserPlus, path: "/connect_people" },
    { label: "Chat", icon: MessageCircle, path: "/chat" },
    { label: "Grok", icon: Sparkles, path: "/grok" },
    { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { label: "Premium", icon: Sparkles, dot: true, path: "/premium" },
    { label: "Profile", icon: User, path: "/profile" },
];

const SidebarMenu = () => {

    const pathname = usePathname();

    return (<>

        {menuItems.map((item) => {

            const Icon = item.icon;

            return (

                <Link
                    key={item.label}
                    href={item.path}
                    className={`flex items-center justify-start gap-3 px-5 py-2.5 rounded-full hover:bg-(--hover) transition w-max  ${pathname === item.path ? "bg-(--hover)" : ""}`}
                >
                    <Icon className="w-6 h-6" />

                    {/* text only on medium screen */}
                    <span className="hidden md:flex text-[18px] font-normal items-center gap-2">
                        {item.label}
                        {item.dot && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </span>

                </Link>


            );
        })}

    </>);
}

export default SidebarMenu;