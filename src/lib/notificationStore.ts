'use client';

import { create } from 'zustand';
import { api } from './api';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    data?: any;
    createdAt: string;
    updatedAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isStale: boolean;
    isFetching: {
        count: boolean;
        list: boolean;
    };
    lastFetched: {
        count: number | null;
        list: number | null;
    };
    setUnreadCount: (count: number) => void;
    setNotifications: (notifications: Notification[]) => void;
    addOrUpdateNotification: (notification: Notification) => void;
    fetchUnreadCount: (force?: boolean) => Promise<Response | undefined>;
    fetchNotifications: (force?: boolean) => Promise<Response | undefined>;
    markAsRead: (id: string) => Promise<Response | undefined>;
    markAllAsRead: () => Promise<Response | undefined>;
    markAsReadLocally: (id: string) => void;
    markAllAsReadLocally: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isStale: false,
    isFetching: {
        count: false,
        list: false
    },
    lastFetched: {
        count: null,
        list: null
    },

    setUnreadCount: (count) => set({ unreadCount: count }),
    
    setNotifications: (notifications) => set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.isRead).length,
        isStale: false,
        lastFetched: { ...get().lastFetched, list: Date.now() },
        isFetching: { ...get().isFetching, list: false }
    }),

    addOrUpdateNotification: (notification) => set((state) => {
        const existing = state.notifications.find(n => n._id === notification._id);
        if (existing) {
            if (new Date(notification.updatedAt) <= new Date(existing.updatedAt)) return state;
            return {
                notifications: state.notifications.map(n => n._id === notification._id ? notification : n),
                unreadCount: state.notifications.map(n => n._id === notification._id ? notification : n).filter(n => !n.isRead).length
            };
        }
        return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
        };
    }),

    fetchUnreadCount: async (force = false) => {
        if (!force && get().lastFetched.count !== null && !get().isStale) return;
        if (get().isFetching.count) return;

        set((state) => ({ isFetching: { ...state.isFetching, count: true } }));
        try {
            const response = await api.notifications.getUnreadCount();
            if (response.ok) {
                const data = await response.json();
                set({ 
                    unreadCount: data.count, 
                    lastFetched: { ...get().lastFetched, count: Date.now() } 
                });
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            throw error;
        } finally {
            set((state) => ({ isFetching: { ...state.isFetching, count: false } }));
        }
    },

    fetchNotifications: async (force = false) => {
        if (!force && get().lastFetched.list !== null && !get().isStale) return;
        if (get().isFetching.list) return;

        set((state) => ({ isFetching: { ...state.isFetching, list: true } }));
        try {
            const response = await api.notifications.getAll();
            if (response.ok) {
                const data = await response.json();
                get().setNotifications(data);
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            throw error;
        } finally {
            set((state) => ({ isFetching: { ...state.isFetching, list: false } }));
        }
    },

    markAsRead: async (id: string) => {
        get().markAsReadLocally(id);
        try {
            const response = await api.notifications.markAsRead(id);
            if (!response.ok) {
                get().fetchUnreadCount(true);
            }
            return response;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            get().fetchUnreadCount(true);
            throw error;
        }
    },

    markAllAsRead: async () => {
        get().markAllAsReadLocally();
        try {
            const response = await api.notifications.markAllAsRead();
            if (!response.ok) {
                get().fetchUnreadCount(true);
                get().fetchNotifications(true);
            }
            return response;
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            get().fetchUnreadCount(true);
            get().fetchNotifications(true);
            throw error;
        }
    },
    
    markAsReadLocally: (id: string) => set((state) => {
        const notification = state.notifications.find(n => n._id === id || (n as any).id === id);
        const shouldDecrement = !notification || !notification.isRead;
        
        return {
            notifications: state.notifications.map(n => (n._id === id || (n as any).id === id) ? { ...n, isRead: true } : n),
            unreadCount: shouldDecrement ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
    }),

    markAllAsReadLocally: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
    }))
}));
