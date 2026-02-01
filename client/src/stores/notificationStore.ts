import api from "@/config/axios";
import { showToast } from "@/utils/showToast";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";



type NotificationType = {
    notification_id: string;
    user_id: string;
    actor_id: string;
    type: 'like' | 'comment' | 'follow' | 'new_post' | 'message';
    message: string;
    post_id?: string;
    comment_id?: string;
    is_read: boolean;
    created_at: string;
    sender?: {
        user_id: string;
        name: string;
        username: string;
        avatar?: string;
    };
}



interface NotificationState {

    socket: Socket | null;
    isConnected: boolean;
    notifications: NotificationType[];
    unreadCount: number;
    isLoading: boolean;


    initSocket: (userId: string) => void;
    disconnectSocket: () => void;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotification: (notification: NotificationType) => void;
    deleteNotification: (notificationId: string) => Promise<void>;

}



const SOCKET_URL = "http://localhost:5510";


export const useNotificationStore = create<NotificationState>((set, get) => ({

    socket: null,
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    isLoading: false,


    // INIT SOCKET ACTION
    initSocket: (userId: string) => {

        const existingSocket = get().socket;

        // if already connected
        if (existingSocket?.connected) return;

        // if already connected to disconnect
        if (existingSocket) existingSocket.disconnect();


        // new socket
        const newSocket = io(SOCKET_URL);


        // Connection event
        newSocket.on("connect", () => {
            set({ isConnected: true });
            // tell server user is online
            newSocket.emit("user-online", userId);
        });


        // Disconnect event
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });



        // New nitification event
        newSocket.on("new-notification", (notification: NotificationType) => {
            // Add notification
            get().addNotification(notification);

        });


        newSocket.on('connect_error', (error) => {
            console.log(error);
            set({ isConnected: false });
        });

        set({ socket: newSocket });

    },



    // DISCONNENT SOCKET ACTIONS
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
            console.log('Socket disconnected manually');
        }
    },



    // FETCH ALL NOTIFICAITIONS
    fetchNotifications: async () => {
        set({ isLoading: true });

        try {

            const response = await api.get("/notifications/all");
            const { success, data } = response.data;

            if (success) {
                set({ notifications: data.notifications, unreadCount: data.unreadCount });
            } else {
                console.error('Failed to fetch notifications:', data.message);
                set({ isLoading: false });
            }

        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            set({ isLoading: false });
        }

    },



    // MARK AS READ ACTION
    markAsRead: async (notificationId: string) => {
        try {

            const response = await api.patch(`/notifications/${notificationId}/read`);
            const { success } = response.data;

            if (success) {

                // update the notification state
                set((state) => ({
                    notifications: state.notifications.map((n => {
                        return n.notification_id === notificationId ? { ...n, is_read: true } : n
                    })),

                    unreadCount: Math.max(0, state.unreadCount - 1)

                }));
            } else {
                console.error('Failed to mark as read');
            }

        } catch (err) {
            console.error('Error marking as read:', err);
            throw err;
        }
    },



    // MARK ALL AS READ ACTION
    markAllAsRead: async () => {
        try {

            const response = await api.patch(`/notifications/mark-all-read`);
            const { success } = response.data;

            if (success) {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                    unreadCount: 0
                }));

                showToast({ type: "success", message: "All notifications marked as read" })
            } else {
                console.error('Failed to mark all as read');
            }

        } catch (err: any) {
            console.error('Error marking as read:', err);
            showToast({ type: "error", message: err.message })
            return;
        }
    },



    // ADD NOTIFICATION (real-time)
    addNotification: (notification: NotificationType) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }))
    },



    // DELETE NOTIIFICATION ACTION
    deleteNotification: async (notificationId: string): Promise<void> => {
        try {

            const response = await api.delete(`/notifications/${notificationId}/delete`);
            const { success, message } = response.data;

            if (success) {

                set((state) => ({

                    notifications: state.notifications.filter((n) => n.notification_id !== notificationId),

                    // if notification is on unread to reduce the unread count
                    unreadNotificationCount: state.notifications.find(n => n.notification_id === notificationId)?.is_read
                        ? state.unreadCount
                        : Math.max(0, state.unreadCount - 1)

                }));

                showToast({ type: "success", message });

            } else {
                console.log("Error in delete notification");
            }

        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}));