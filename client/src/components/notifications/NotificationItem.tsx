import React, { useState } from 'react';
import { MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import Link from 'next/link';
import { useNotificationStore } from '@/stores/notificationStore';


// Props
interface NotificationItemProps {
    notificationData: {
        notification_id: string;
        message: string;
        is_read: boolean;
        created_at: string;
        sender?: {
            name: string;
            username: string;
            avatar?: string;
        };
    };
}



const NotificationItem: React.FC<NotificationItemProps> = ({
    notificationData,
}) => {

    const { notification_id, sender, message, created_at, is_read } = notificationData;
    const [showMenu, setShowMenu] = useState(false);


    const { markAsRead, deleteNotification } = useNotificationStore();


    return (


        <div
            className={`group relative flex items-start gap-4 p-4 border-b transition-all duration-200 text-(--text-color)
            ${!is_read ? 'bg-(--hover)/80' : 'bg-(--bg-color)'} 
            border-(--input-border) hover:bg-(--hover)/50`}
        >


            {/* Avatar Section */}
            <div className="relative shrink-0">
                <img
                    src={sender?.avatar || '/default-avatar.png'}
                    alt={sender?.username}
                    className="w-11 h-11 rounded-full object-cover border border-(--input-border) shadow-sm"
                />
                {!is_read && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-(--bg-color)"></span>
                )}
            </div>



            {/* Content Section */}
            <div className="flex-1 pr-8">

                <div className="flex items-center gap-1.5 flex-wrap">

                    <Link href={`/@${sender?.username}`} className="font-bold text-[15px] text-(--text-color) leading-none hover:underline cursor-pointer">
                        {sender?.name}
                    </Link>

                    <span className="text-(--secondary-text) text-sm italic">
                        @{sender?.username}
                    </span>

                    <span className="text-[10px] text-(--secondary-text) font-medium">
                        • {useTimeAgo(new Date(created_at))}
                    </span>
                </div>

                <p className="text-[14px] text-(--text-color) mt-1 leading-normal">
                    {message}
                </p>

            </div>



            {/* 3-Dot Menu Button */}
            <div className="absolute right-3 top-4">

                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-xl text-(--text-color) cursor-pointer transition-colors ${is_read ? "hover:bg-(--hover)" : "hover:bg-(--bg-color) rounded-lg"}`}
                >
                    <MoreHorizontal size={18} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>

                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>

                        <div className="absolute right-0 mt-2 w-48 bg-(--bg-color) p-2 border border-(--input-border) rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-100">

                            {!is_read && (
                                <button
                                    onClick={() => {
                                        markAsRead(notification_id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl cursor-pointer hover:bg-(--hover)/70 transition-colors"
                                >
                                    <CheckCircle size={16} className="text-blue-500" />
                                    Mark as read
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    deleteNotification(notification_id);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete notification
                            </button>

                        </div>
                    </>
                )}
            </div>


        </div>
    );
}

export default NotificationItem;
