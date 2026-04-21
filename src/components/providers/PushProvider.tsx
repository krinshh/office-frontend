'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useSettings } from '@/lib/settingsContext';

export const PushProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, token } = useAuthStore();
    const { settings } = useSettings();
    const registrationAttempted = useRef(false);
    const isRegistering = useRef(false);

    useEffect(() => {
        const handleRegistration = () => {
            if (isAuthenticated && token && settings?.notifications.pushNotifications && !registrationAttempted.current && !isRegistering.current) {
                registrationAttempted.current = true;
                registerAndSubscribe();
            }
        };

        if (document.readyState === 'complete') {
            handleRegistration();
        } else {
            window.addEventListener('load', handleRegistration);
            return () => window.removeEventListener('load', handleRegistration);
        }
    }, [isAuthenticated, token, settings?.notifications.pushNotifications]);

    const registerAndSubscribe = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported in this browser');
            return;
        }

        if (isRegistering.current) return;
        isRegistering.current = true;

        try {
            // 1. Register Service Worker
            console.log('Registering Service Worker...');
            const registration = await navigator.serviceWorker.register('/sw.js');

            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');

            // 2. Request Permission
            if (Notification.permission === 'default') {
                console.log('Requesting notification permission...');
                await Notification.requestPermission();
            }

            if (Notification.permission !== 'granted') {
                console.warn('Push notification permission denied');
                isRegistering.current = false;
                return;
            }

            // 3. Get Public Key from Backend
            const keyResponse = await api.push.getPublicKey();
            const data = await keyResponse.json();
            const publicKey = data.publicKey?.replace(/\s/g, '');

            if (!publicKey) {
                console.error('Failed to get VAPID public key');
                isRegistering.current = false;
                return;
            }

            // 4. Check for existing subscription
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                await api.push.subscribe(existingSubscription);
                console.log('✅ Reused existing push subscription');
                isRegistering.current = false;
                return;
            }

            // 5. Subscribe
            console.log('Subscribing to Push Manager...');
            try {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });

                // 6. Send to Backend
                await api.push.subscribe(subscription);
                console.log('✅ Web Push Subscription Success');
            } catch (subError: any) {
                if (subError.name === 'AbortError') {
                    console.warn('Push subscription was aborted by the browser (benign). It will retry on next render.');
                    registrationAttempted.current = false; // Allow retry
                } else if (subError.name === 'InvalidAccessError') {
                    console.error('VAPID Key Conflict! Clearing everything...');
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let reg of registrations) await reg.unregister();
                } else {
                    console.error('Push Service Error:', subError.message);
                }
            }
        } catch (error: any) {
            // Catch top-level registration errors (like AbortError on the register() call itself)
            if (error.name === 'AbortError') {
                console.warn('Service Worker registration aborted (benign).');
                registrationAttempted.current = false; // Allow retry next time
            } else {
                console.error('Failed to register/subscribe for push:', error);
            }
        } finally {
            isRegistering.current = false;
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        if (!base64String) return new Uint8Array(0);
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return <>{children}</>;
};
