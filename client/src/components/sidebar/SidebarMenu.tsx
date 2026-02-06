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
import { useNotificationStore } from "@/stores/notificationStore";


type IconType = ComponentType<{ className?: string }>;

type MenuItems = {
    label: string;
    icon: IconType;
    path: string;
    showBadge?: boolean;
}


const menuItems: MenuItems[] = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Explore", icon: Search, path: "/explore" },
    { label: "Notifications", icon: Bell, path: "/notifications", showBadge: true },
    { label: "Follow", icon: UserPlus, path: "/connect_people" },
    { label: "Chat", icon: MessageCircle, path: "/chat" },
    { label: "Grok", icon: Sparkles, path: "/grok" },
    { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { label: "Premium", icon: Sparkles, path: "/premium" },
    { label: "Profile", icon: User, path: "/profile" },
];

const SidebarMenu = () => {

    const pathname = usePathname();
    const { unreadCount } = useNotificationStore();

    return (<>

        {menuItems.map((item) => {

            const Icon = item.icon;

            return (

                <Link
                    key={item.label}
                    href={item.path}
                    className={`flex items-center justify-start gap-3 px-5 py-2.5 rounded-full hover:bg-(--hover) transition w-max relative ${pathname === item.path ? "bg-(--hover)" : ""
                        }`}
                >

                    {/* Icon with Badge */}
                    <div className="relative">
                        <Icon className={`w-6 h-6 ${pathname === item.path ? "fill-(--text-color)" : ""}`} />

                        {item.showBadge && unreadCount > 0 && (
                            <span className="max-sm:flex max-md:flex hidden absolute -top-2 -right-2 items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}

                    </div>

                    {/* Text only on medium screen */}
                    <span className="hidden md:flex text-[18px] font-normal items-center gap-2">
                        {item.label}

                        {item.showBadge && unreadCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}

                    </span>
                </Link>


            );
        })}

    </>);
}

export default SidebarMenu;