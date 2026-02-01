"use client";


import NotificationList from '@/components/notifications/NotificationList';
import { useNotificationStore } from '@/stores/notificationStore';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


const NotificationsPage = () => {

    const router = useRouter();
    const { notifications, markAllAsRead } = useNotificationStore();

    return (<>

        <div className="min-h-screen bg-(--bg-color) text-(--text-color)">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-4 h-15 sticky top-0 bg-(--bg-color) z-50 border-b border-(--input-border)">

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-(--hover)/50 transition-all cursor-pointer" onClick={() => {
                        router.back()
                    }}>
                        <ArrowLeft className="w-5 h-5 cursor-pointer" />
                    </button>

                    <h2 className="text-[18px] font-medium">Notifications</h2>
                </div>

                {notifications.length > 1 ? <button className='pr-3 underline text-(--button-bg) cursor-pointer'
                    onClick={markAllAsRead}
                >Mark all as read</button> : null}

            </div>

            <div className="pb-10">
                <NotificationList />
            </div>

        </div>

    </>);
}

export default NotificationsPage