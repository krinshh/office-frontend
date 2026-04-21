'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { useSettings } from '@/lib/settingsContext';
import { useNotificationStore } from '@/lib/notificationStore';
import { useToastStore } from '@/lib/toastStore';
import { useTranslations } from 'next-intl';
import { useTaskStore } from '@/lib/taskStore';
import { useAppStore } from '@/lib/appStore';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useSalaryStore } from '@/lib/salaryStore';
import { useConfigStore } from '@/lib/configStore';
import { api } from '@/lib/api';

// Helper to play a subtle notification sound using Web Audio API
const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Handle browser autoplay policy
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const playTone = (freq: number, start: number, duration: number) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, start);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, start + duration);

            // Increased gain to 0.2 for better audibility
            gainNode.gain.setValueAtTime(0.2, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(start);
            oscillator.stop(start + duration);
        };

        // Play a nice audible double chime
        const now = audioCtx.currentTime;
        playTone(880, now, 0.15); // A5
        playTone(1174.66, now + 0.12, 0.2); // D6
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
};

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

// Buffered throttle to prevent rapid re-renders while ensuring 100% data integrity
const throttle = (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let pendingCalls: any[][] = [];
    return (...args: any[]) => {
        pendingCalls.push(args);
        if (!timeoutId) {
            timeoutId = setTimeout(() => {
                const calls = [...pendingCalls];
                pendingCalls = [];
                timeoutId = null;
                // Batch execution: React 18/19 will automatically batch these multiple state updates
                calls.forEach(c => fn(...c));
            }, delay);
        }
    };
};

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const t = useTranslations();
    const { user: currentUser, token, isAuthenticated, logout, updateUserData } = useAuthStore();
    const { settings, syncSettings } = useSettings();
    const {
        fetchUnreadCount, addOrUpdateNotification, setUnreadCount,
        markAsReadLocally, markAllAsReadLocally
    } = useNotificationStore();
    const { addToast } = useToastStore();
    const { addOrUpdateTask, addOrUpdateAssignment, fetchTasks, fetchAssignments, lastFetched: taskLastFetched } = useTaskStore();
    const {
        fetchOffices, fetchUserTypes, fetchUsers,
        addOrUpdateOffice, addOrUpdateUserType, addOrUpdateUser,
        lastFetched: appLastFetched
    } = useAppStore();
    const {
        fetchMyAttendance, fetchLivePresence, fetchDailyStats,
        addOrUpdateMyAttendance, updateLivePresenceNode, updateAdminViewedAttendance,
        lastFetched: attendanceLastFetched
    } = useAttendanceStore();
    const {
        addOrUpdateSalary, addMultipleSalaries,
        fetchSalaries, lastFetched: salaryLastFetched
    } = useSalaryStore();
    const {
        setConfig, addOrUpdateHRASlab, removeHRASlab,
        fetchConfig, fetchHRASlabs, lastFetched: configLastFetched
    } = useConfigStore();
    const { refreshSettings } = useSettings();
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            disconnectSocket();
            setIsConnected(false);
            setSocketInstance(null);
            return;
        }

        let idleHandle: any;
        const s = initSocket(token || 'cookie-session');

        const setupListeners = () => {
            console.log('Initializing socket listeners during idle period...');
            setSocketInstance(s);

            s.on('connect', () => {
                setIsConnected(true);
                console.log('✅ Real-time notifications connected');
                fetchUnreadCount();

                if (useTaskStore.getState().isStale) {
                    fetchTasks(true);
                    fetchAssignments(true);
                }

                if (Object.values(useAppStore.getState().isStale).some(v => v)) {
                    fetchOffices(true);
                    fetchUserTypes(true);
                    fetchUsers(true);
                }

                if (Object.values(useAttendanceStore.getState().isStale).some(v => v)) {
                    fetchMyAttendance(true);
                    fetchLivePresence(true);
                    fetchDailyStats(true);
                }

                if (useSalaryStore.getState().isStale) {
                    fetchSalaries(true, currentUser?.userType?.name === 'Admin');
                }

                if (Object.values(useConfigStore.getState().isStale).some(v => v)) {
                    fetchConfig(true);
                    fetchHRASlabs(true);
                }
            });

            s.on('disconnect', () => {
                setIsConnected(false);
                console.log('❌ Real-time notifications disconnected - Flagging Cache as Suspect');
                useTaskStore.getState().setStale(true);
                useSalaryStore.getState().setStale(true);
                const appStore = useAppStore.getState();
                appStore.setStale('offices', true);
                appStore.setStale('userTypes', true);
                appStore.setStale('users', true);
                const attStore = useAttendanceStore.getState();
                attStore.setStale('myAttendance', true);
                attStore.setStale('livePresence', true);
                attStore.setStale('dailyStats', true);
                attStore.setStale('adminSelectedUserAttendance', true);
                const configStore = useConfigStore.getState();
                configStore.setStale('config', true);
                configStore.setStale('hraSlabs', true);
            });

            // Global listener for new notifications
            s.on('notification:new', throttle((data: any) => {
                const isQuietHour = () => {
                    if (!settings?.notifications.quietHours?.enabled) return false;
                    const now = new Date();
                    const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const { start, end } = settings.notifications.quietHours;
                    if (start < end) return currentStr >= start && currentStr <= end;
                    else return currentStr >= start || currentStr <= end;
                };

                const quiet = isQuietHour();
                addOrUpdateNotification(data as any);
                fetchUnreadCount(true);
                if (settings?.notifications.soundNotifications !== false && !quiet) playNotificationSound();

                if (settings?.notifications.liveNotifications !== false && !quiet) {
                    let actionPath = '/dashboard/notifications';
                    let actionLabel = t('notifications.viewNotifications');
                    if (data.type === 'task_assigned' || data.type === 'task_due') {
                        actionPath = '/user/tasks';
                        actionLabel = t('notifications.viewTasks');
                    } else if (data.type === 'salary_generated') {
                        actionPath = '/user/salary';
                        actionLabel = t('notifications.viewSalary');
                    }

                    addToast({
                        title: data.title,
                        message: data.message,
                        type: 'success',
                        duration: 5000,
                        actionPath,
                        actionLabel
                    });

                    if (document.visibilityState !== 'visible' && Notification.permission === 'granted') {
                        new Notification(data.title, {
                            body: data.message,
                            icon: '/icons/icon-192x192.webp',
                            data: { url: actionPath }
                        }).onclick = (e: any) => {
                            window.focus();
                            window.location.href = e.target.data.url;
                        };
                    }
                }
            }, 300));

            s.on('notification:read', throttle((data: any) => {
                const id = typeof data === 'string' ? data : (data?.id || data?._id);
                if (id) markAsReadLocally(id);
                fetchUnreadCount(true);
            }, 300));

            s.on('sync:task_created', throttle((taskData: any) => addOrUpdateTask(taskData), 300));
            s.on('sync:assignment_created', throttle((assignmentData: any) => {
                addOrUpdateAssignment(assignmentData);
                useTaskStore.getState().incrementStats('active');
            }, 300));

            s.on('sync:assignment_updated', throttle((updatedData: any) => {
                const isAdmin = useAuthStore.getState().user?.userType?.name === 'Admin';
                const wasJustCompleted = (updatedData as any).wasCompletedNow;
                if (isAdmin && updatedData.status === 'Completed') {
                    const now = new Date();
                    const completedDate = new Date(updatedData.completedAt || now);
                    if (completedDate.getMonth() !== now.getMonth() || completedDate.getFullYear() !== now.getFullYear()) {
                        useTaskStore.getState().removeAssignment(updatedData._id);
                        return;
                    }
                } else if (!isAdmin && updatedData.status === 'Completed') {
                    useTaskStore.getState().removeAssignment(updatedData._id);
                    return;
                }
                addOrUpdateAssignment(updatedData);
                if (wasJustCompleted) {
                    useTaskStore.getState().decrementStats('active');
                    const now = new Date();
                    const completedDate = new Date(updatedData.completedAt || now);
                    if (completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear()) {
                        useTaskStore.getState().incrementStats('completed');
                    }
                }
            }, 300));

            s.on('sync:office_updated', throttle((officeData: any) => addOrUpdateOffice(officeData), 500));
            s.on('sync:user_type_updated', throttle((typeData: any) => addOrUpdateUserType(typeData), 500));
            s.on('sync:user_updated', throttle((userData: any) => {
                addOrUpdateUser(userData);
                if (currentUser && currentUser.id === userData._id) {
                    updateUserData({
                        name: userData.name, email: userData.email, mobile: userData.mobile,
                        userType: userData.userType, office: userData.office, photo: userData.photo,
                        shiftTimings: userData.shiftTimings, accountDetails: userData.accountDetails,
                        joiningDate: userData.joiningDate
                    });
                }
            }, 500));

            s.on('sync:attendance_updated', throttle((attendanceData: any) => {
                addOrUpdateMyAttendance(attendanceData);
                updateAdminViewedAttendance(attendanceData);
                const now = new Date();
                const attDate = new Date(attendanceData.date);
                if (attendanceData && Array.isArray(attendanceData.sessions) && attendanceData.sessions.length === 1 && !attendanceData.sessions[0].outTime && attDate.getMonth() === now.getMonth() && attDate.getFullYear() === now.getFullYear()) {
                    useAttendanceStore.getState().incrementAttendanceCount();
                }
            }, 300));

            s.on('sync:attendance_presence_updated', throttle((presenceNode: any) => updateLivePresenceNode(presenceNode), 300));
            s.on('sync:salary_generated', (salaryData) => Array.isArray(salaryData) ? addMultipleSalaries(salaryData) : addOrUpdateSalary(salaryData));
            s.on('sync:salary_updated', (salaryData) => addOrUpdateSalary(salaryData));
            s.on('sync:global_config_updated', (configData) => setConfig(configData));
            s.on('sync:hra_slab_created', (slabData) => addOrUpdateHRASlab(slabData));
            s.on('sync:hra_slab_updated', (slabData) => addOrUpdateHRASlab(slabData));
            s.on('sync:hra_slab_deleted', (slabId) => removeHRASlab(slabId));
            s.on('sync:user_deactivated', async (userId) => {
                if (currentUser && currentUser.id === userId) {
                    addToast({ title: t('auth.sessionExpired'), message: t('auth.accountDeactivated'), type: 'error' });

                    try {
                        // Tell backend to clear the zombie cookie
                        await api.auth.logout();
                    } catch (e) { }

                    // Hard redirection silences ghost UI states
                    const theme = localStorage.getItem('theme');
                    localStorage.clear();
                    if (theme) localStorage.setItem('theme', theme);
                    sessionStorage.clear();
                    window.location.replace('/');
                }
            });
            s.on('sync:settings_updated', (settingsData) => syncSettings(settingsData));
            s.on('notification:read_all', () => markAllAsReadLocally());
        };

        if (typeof window !== 'undefined') {
            if ('requestIdleCallback' in window) {
                idleHandle = (window as any).requestIdleCallback(() => setupListeners(), { timeout: 1000 });
            } else {
                setTimeout(setupListeners, 1000);
            }
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchUnreadCount(true);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (idleHandle && 'cancelIdleCallback' in window) (window as any).cancelIdleCallback(idleHandle);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            s.off('connect');
            s.off('disconnect');
            s.off('notification:new');
            s.off('notification:read');
            s.off('sync:task_created');
            s.off('sync:assignment_created');
            s.off('sync:assignment_updated');
            s.off('sync:office_updated');
            s.off('sync:user_type_updated');
            s.off('sync:user_updated');
            s.off('sync:attendance_updated');
            s.off('sync:attendance_presence_updated');
            s.off('sync:salary_generated');
            s.off('sync:salary_updated');
            s.off('sync:global_config_updated');
            s.off('sync:hra_slab_created');
            s.off('sync:hra_slab_updated');
            s.off('sync:hra_slab_deleted');
            s.off('sync:user_deactivated');
            s.off('sync:settings_updated');
            s.off('notification:read_all');
            setIsConnected(false);
            setSocketInstance(null);
        };
    }, [isAuthenticated, token, settings?.notifications.liveNotifications]);

    return (
        <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
