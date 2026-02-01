import { useNotificationStore } from "@/stores/notificationStore";
import NotificationItem from "./NotificationItem";
import { BellOff, Loader } from "lucide-react";
import Link from "next/link";

const NotificationList = () => {


    // get user from auth store
    const { notifications, isLoading } = useNotificationStore();



    if (!isLoading && notifications.length === 0) {
        return <div className='flex items-center justify-center mt-50'>
            <div className="flex flex-col gap-5">
                <BellOff size={50} color='var(--secondary-text)' className='mx-auto' />
                <p className='text-(--secondary-text) text-[18px]'>You've no Notifications yet.</p>
                <Link href="/explore" className='surface-btn w-max mx-auto'>Explore</Link>
            </div>
        </div>
    }


    if (isLoading) {
        return <div>
            <Loader className="animate-spin mx-auto mt-20" color='var(--button-bg)' />
        </div>
    }

    return (<>

        {notifications.map((notification) => (
            <NotificationItem notificationData={notification} key={notification.notification_id} />
        ))}

    </>);
}

export default NotificationList;