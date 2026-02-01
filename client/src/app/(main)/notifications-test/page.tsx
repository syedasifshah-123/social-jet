
// // src/pages/NotificationTestPage.jsx
// "use client";


// import { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import toast, { Toaster } from 'react-hot-toast';
// import { useAuthStore } from '../../../stores/authStore'; // ← Tumhara Zustand store

// const NotificationTestPage = () => {
//     // Zustand se user lena
//     const { user } = useAuthStore();

//     // State
//     const [socket, setSocket] = useState(null);
//     const [isConnected, setIsConnected] = useState(false);
//     const [notifications, setNotifications] = useState([]);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//     // Socket connection setup
//     useEffect(() => {

//         if (!user) {
//             console.log('⚠️ No user logged in');
//             return;
//         }

//         // Socket.IO connection
//         const newSocket = io('http://localhost:5510', {
//             auth: {
//                 token: localStorage.getItem('accessToken')
//             }
//         });

//         // Connection events
//         newSocket.on('connect', () => {
//             console.log('✅ Socket connected:', newSocket.id);
//             setIsConnected(true);

//             // Tell server user is online
//             newSocket.emit('user-online', user.userId);
//         });

//         newSocket.on('disconnect', () => {
//             console.log('❌ Socket disconnected');
//             setIsConnected(false);
//         });

//         // ✅ Listen for new notifications
//         newSocket.on('new-notification', (notification) => {
//             console.log('🔔 New notification received:', notification);

//             // Add to notifications array
//             setNotifications(prev => [notification, ...prev]);

//             // Increment unread count
//             setUnreadCount(prev => prev + 1);

//             // Play sound
//         });

//         setSocket(newSocket);

//         // Cleanup
//         return () => {
//             newSocket.disconnect();
//         };
//     }, [user]);

//     // Fetch notifications from API
//     useEffect(() => {
//         if (user) {
//             fetchNotifications();
//         }
//     }, [user]);

//     const fetchNotifications = async () => {
//         try {
//             const response = await fetch('http://localhost:5510/api/notifications/all');

//             const data = await response.json();

//             if (data.success) {
//                 setNotifications(data.data.notifications);
//                 setUnreadCount(data.data.unreadCount);
//             }
//         } catch (error) {
//             console.error('Error fetching notifications:', error);
//         }
//     };

//     const markAsRead = async (notificationId: string) => {
//         try {
//             const response = await fetch(
//                 `http://localhost:5000/api/notifications/${notificationId}/read`,
//                 {
//                     method: 'PATCH',
//                     headers: {
//                         'Authorization': `Bearer ${localStorage.getItem('token')}`
//                     }
//                 }
//             );

//             if (response.ok) {
//                 // Update state
//                 setNotifications(prev =>
//                     prev.map(n =>
//                         n.notification_id === notificationId
//                             ? { ...n, is_read: true }
//                             : n
//                     )
//                 );

//                 setUnreadCount(prev => Math.max(0, prev - 1));
//             }
//         } catch (error) {
//             console.error('Error marking as read:', error);
//         }
//     };

//     const markAllAsRead = async () => {
//         try {
//             const response = await fetch(
//                 'http://localhost:5000/api/notifications/mark-all-read',
//                 {
//                     method: 'PATCH',
//                     headers: {
//                         'Authorization': `Bearer ${localStorage.getItem('token')}`
//                     }
//                 }
//             );

//             if (response.ok) {
//                 setNotifications(prev =>
//                     prev.map(n => ({ ...n, is_read: true }))
//                 );
//                 setUnreadCount(0);
//                 toast.success('All notifications marked as read');
//             }
//         } catch (error) {
//             console.error('Error marking all as read:', error);
//         }
//     };

//     const getIcon = (type: string) => {
//         const icons = {
//             'like': '❤️',
//             'comment': '💬',
//             'follow': '👤',
//             'new_post': '📝',
//             'message': '✉️'
//         };
//         return icons[type] || '🔔';
//     };

//     const formatTime = (timestamp) => {
//         const now = new Date();
//         const time = new Date(timestamp);
//         const diff = Math.floor((now - time) / 1000);

//         if (diff < 60) return 'Just now';
//         if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//         if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//         if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
//         return time.toLocaleDateString();
//     };


//     if (!user) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-100">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">
//                         Please Login First
//                     </h2>
//                     <p className="text-gray-600">You need to be logged in to receive notifications</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Toast Container */}
//             <Toaster position="top-right" />

//             {/* Header with Notification Bell */}
//             <div className="bg-white shadow-sm border-b sticky top-0 z-50">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-16">
//                         <div>
//                             <h1 className="text-xl font-bold text-gray-900">
//                                 Notification Test Page
//                             </h1>
//                         </div>

//                         <div className="flex items-center gap-4">
//                             {/* Connection Status */}
//                             <div className="flex items-center gap-2">
//                                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                                 <span className="text-sm text-gray-600">
//                                     {isConnected ? 'Connected' : 'Disconnected'}
//                                 </span>
//                             </div>

//                             {/* Notification Bell */}
//                             <div className="relative">
//                                 <button
//                                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                                     className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
//                                 >
//                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                                     </svg>

//                                     {/* Badge */}
//                                     {unreadCount > 0 && (
//                                         <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
//                                             {unreadCount > 99 ? '99+' : unreadCount}
//                                         </span>
//                                     )}
//                                 </button>

//                                 {/* Dropdown */}
//                                 {isDropdownOpen && (
//                                     <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] overflow-hidden z-50">
//                                         {/* Header */}
//                                         <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
//                                             <h3 className="text-lg font-semibold text-gray-900">
//                                                 Notifications
//                                             </h3>
//                                             {unreadCount > 0 && (
//                                                 <button
//                                                     onClick={markAllAsRead}
//                                                     className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//                                                 >
//                                                     Mark all as read
//                                                 </button>
//                                             )}
//                                         </div>

//                                         {/* Notification List */}
//                                         <div className="overflow-y-auto max-h-[500px]">
//                                             {notifications.length === 0 ? (
//                                                 <div className="py-12 text-center">
//                                                     <div className="text-6xl mb-4">📭</div>
//                                                     <p className="text-gray-500">No notifications yet</p>
//                                                 </div>
//                                             ) : (
//                                                 notifications.map((notification) => (
//                                                     <div
//                                                         key={notification.notification_id}
//                                                         onClick={() => markAsRead(notification.notification_id)}
//                                                         className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50' : 'bg-white'
//                                                             }`}
//                                                     >
//                                                         <div className="flex items-start gap-3">
//                                                             {/* Avatar */}
//                                                             <div className="flex-shrink-0">
//                                                                 {notification.sender?.avatar ? (
//                                                                     <img
//                                                                         src={notification.sender.avatar}
//                                                                         alt={notification.sender.name}
//                                                                         className="w-12 h-12 rounded-full object-cover"
//                                                                     />
//                                                                 ) : (
//                                                                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
//                                                                         {notification.sender?.name?.[0] || '?'}
//                                                                     </div>
//                                                                 )}
//                                                             </div>

//                                                             {/* Content */}
//                                                             <div className="flex-1 min-w-0">
//                                                                 <div className="flex items-start gap-2">
//                                                                     <span className="text-lg">{getIcon(notification.type)}</span>
//                                                                     <div className="flex-1">
//                                                                         <p className="text-sm text-gray-900">
//                                                                             <span className="font-semibold">
//                                                                                 {notification.sender?.name}
//                                                                             </span>{' '}
//                                                                             {notification.message?.replace(notification.sender?.name, '') || ''}
//                                                                         </p>
//                                                                         <p className="text-xs text-gray-500 mt-1">
//                                                                             {formatTime(notification.created_at)}
//                                                                         </p>
//                                                                     </div>

//                                                                     {/* Unread dot */}
//                                                                     {!notification.is_read && (
//                                                                         <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* User Info */}
//                             <div className="flex items-center gap-2 pl-4 border-l">
//                                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
//                                     {user.name?.[0] || 'U'}
//                                 </div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                     {user.name}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 <div className="bg-white rounded-lg shadow-sm border p-6">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                         Real-Time Notification Testing
//                     </h2>

//                     <div className="space-y-4">
//                         {/* Status Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
//                                 <div className="text-sm font-medium opacity-90">Connection Status</div>
//                                 <div className="text-2xl font-bold mt-1">
//                                     {isConnected ? 'Connected ✅' : 'Disconnected ❌'}
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
//                                 <div className="text-sm font-medium opacity-90">Total Notifications</div>
//                                 <div className="text-2xl font-bold mt-1">{notifications.length}</div>
//                             </div>

//                             <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
//                                 <div className="text-sm font-medium opacity-90">Unread Notifications</div>
//                                 <div className="text-2xl font-bold mt-1">{unreadCount}</div>
//                             </div>
//                         </div>

//                         {/* Instructions */}
//                         <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                                 🧪 Testing Instructions
//                             </h3>
//                             <ul className="space-y-2 text-gray-700">
//                                 <li className="flex items-start gap-2">
//                                     <span className="text-green-600 font-bold">1.</span>
//                                     <span>Open another browser/incognito window and login as different user</span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <span className="text-green-600 font-bold">2.</span>
//                                     <span>Like a post, comment, or follow this user</span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <span className="text-green-600 font-bold">3.</span>
//                                     <span>Watch notification appear in real-time! 🔔</span>
//                                 </li>
//                                 <li className="flex items-start gap-2">
//                                     <span className="text-green-600 font-bold">4.</span>
//                                     <span>Click bell icon to see all notifications</span>
//                                 </li>
//                             </ul>
//                         </div>

//                         {/* Debug Info */}
//                         <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
//                             <div className="flex items-center justify-between mb-2">
//                                 <span className="font-bold text-green-400">Debug Info:</span>
//                                 <span className="text-xs text-gray-400">Live Console</span>
//                             </div>
//                             <div className="space-y-1 text-xs">
//                                 <div>User ID: <span className="text-yellow-300">{user.user_id}</span></div>
//                                 <div>Socket ID: <span className="text-yellow-300">{socket?.id || 'Not connected'}</span></div>
//                                 <div>Notifications: <span className="text-yellow-300">{notifications.length}</span></div>
//                                 <div>Unread: <span className="text-yellow-300">{unreadCount}</span></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default NotificationTestPage;






// src/pages/NotificationTestPage.tsx

"use client";

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';

const NotificationTestPage = () => {
    const { user } = useAuthStore();
    const {
        socket,
        isConnected,
        notifications,
        unreadCount,
        initSocket,
        disconnectSocket,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Initialize socket on mount
    useEffect(() => {
        if (user?.userId) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Initialize socket
                initSocket(user.userId, token);

                // Fetch existing notifications
                fetchNotifications(token);
            }
        }

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };
    }, [user?.userId]);

    const handleMarkAsRead = (notificationId: string) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            markAsRead(notificationId, token);
        }
    };

    const handleMarkAllAsRead = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            markAllAsRead(token);
        }
    };

    const getIcon = (type: string) => {
        const icons: Record<string, string> = {
            'like': '❤️',
            'comment': '💬',
            'follow': '👤',
            'new_post': '📝',
            'message': '✉️'
        };
        return icons[type] || '🔔';
    };

    const formatTime = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return time.toLocaleDateString();
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Please Login First
                    </h2>
                    <p className="text-gray-600">You need to be logged in to receive notifications</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Notification Test Page
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Connection Status */}
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>

                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>

                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] overflow-hidden z-50">
                                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div className="overflow-y-auto max-h-[500px]">
                                            {notifications.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <div className="text-6xl mb-4">📭</div>
                                                    <p className="text-gray-500">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.notification_id}
                                                        onClick={() => handleMarkAsRead(notification.notification_id)}
                                                        className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50' : 'bg-white'}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0">
                                                                {notification.sender?.avatar ? (
                                                                    <img
                                                                        src={notification.sender.avatar}
                                                                        alt={notification.sender.name}
                                                                        className="w-12 h-12 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                                                        {notification.sender?.name?.[0] || '?'}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="text-lg">{getIcon(notification.type)}</span>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm text-gray-900">
                                                                            <span className="font-semibold">
                                                                                {notification.sender?.name}
                                                                            </span>{' '}
                                                                            {notification.message?.replace(notification.sender?.name || '', '')}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {formatTime(notification.created_at)}
                                                                        </p>
                                                                    </div>

                                                                    {!notification.is_read && (
                                                                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-2 pl-4 border-l">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {user.name?.[0] || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Real-Time Notification Testing
                    </h2>

                    <div className="space-y-4">
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                <div className="text-sm font-medium opacity-90">Connection Status</div>
                                <div className="text-2xl font-bold mt-1">
                                    {isConnected ? 'Connected ✅' : 'Disconnected ❌'}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                <div className="text-sm font-medium opacity-90">Total Notifications</div>
                                <div className="text-2xl font-bold mt-1">{notifications.length}</div>
                            </div>

                            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                                <div className="text-sm font-medium opacity-90">Unread Notifications</div>
                                <div className="text-2xl font-bold mt-1">{unreadCount}</div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                🧪 Testing Instructions
                            </h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">1.</span>
                                    <span>Open another browser/incognito window and login as different user</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">2.</span>
                                    <span>Like a post, comment, or follow this user</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">3.</span>
                                    <span>Watch notification appear in real-time! 🔔</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 font-bold">4.</span>
                                    <span>Click bell icon to see all notifications</span>
                                </li>
                            </ul>
                        </div>

                        {/* Debug Info */}
                        <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-green-400">Debug Info:</span>
                                <span className="text-xs text-gray-400">Live Console</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div>User ID: <span className="text-yellow-300">{user.userId}</span></div>
                                <div>Socket ID: <span className="text-yellow-300">{socket?.id || 'Not connected'}</span></div>
                                <div>Notifications: <span className="text-yellow-300">{notifications.length}</span></div>
                                <div>Unread: <span className="text-yellow-300">{unreadCount}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationTestPage;