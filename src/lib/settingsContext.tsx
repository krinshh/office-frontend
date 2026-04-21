'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { api } from './api';
import { useAuthStore } from './store';
import { useRouter, usePathname } from '@/navigation';
import { useLocale } from 'next-intl';

interface Settings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  appearance: {
    theme: string;
    compactMode: boolean;
    animations: boolean;
  };
  notifications: {
    taskAssignment: boolean;
    attendanceReminders: boolean;
    salaryAlerts: boolean;
    systemUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    liveNotifications: boolean;
    soundNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    autoLogout: number;
    twoFactorAuth: boolean;
    dataRetention: number;
  };
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (section: string, newSettings: any) => Promise<void>;
  refreshSettings: () => Promise<void>;
  syncSettings: (update: { section: string; settings: any }) => void;
  getNotificationPreferences: () => {
    email: boolean;
    push: boolean;
  };
}

const defaultSettings: Settings = {
  general: {
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
  },
  appearance: {
    theme: 'dark',
    compactMode: false,
    animations: true,
  },
  notifications: {
    taskAssignment: true,
    attendanceReminders: true,
    salaryAlerts: true,
    systemUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
    liveNotifications: true,
    soundNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  privacy: {
    autoLogout: 30,
    twoFactorAuth: false,
    dataRetention: 365,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Persistent Cache & Lock for handle locale-switch remounts
let persistentSettingsCache: Settings | null = null;
let isFetchingSettings = false;

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(persistentSettingsCache);
  const [loading, setLoading] = useState(!persistentSettingsCache);
  const { user, logout } = useAuthStore();

  // Auto-logout timer
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Localization
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  // Load settings on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshSettings();
    } else {
      setSettings(null);
      setLoading(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('settings_language_synced');
      }
    }
  }, [user]);

  // Initialization flag to prevent reactive updates from WebSockets from flipping the UI
  const initialSyncDone = useRef(false);

  // Apply language when settings load (ONLY on first load)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSyncedSession = sessionStorage.getItem('settings_language_synced');
    
    if (settings && !hasSyncedSession) {
      const dbLang = settings.general?.language || 'en';
      const dbTheme = settings.appearance?.theme || 'dark';

      // 1. Initial Language Redirect (Once per session)
      if (dbLang !== currentLocale) {
        router.replace(pathname, { locale: dbLang });
      }
      sessionStorage.setItem('settings_language_synced', 'true');

      // 2. Initial Theme Application
      // Dispatch event so ThemeProvider can pick it up for the first time
      window.dispatchEvent(new CustomEvent('app:theme-sync', { detail: dbTheme }));
    }
  }, [settings, currentLocale, pathname, router]);

  // Apply auto-logout when settings change
  useEffect(() => {
    if (settings?.privacy.autoLogout && settings.privacy.autoLogout > 0) {
      setupAutoLogout(settings.privacy.autoLogout);
    } else {
      clearAutoLogout();
    }

    return () => {
      clearAutoLogout();
    };
  }, [settings?.privacy.autoLogout]);

  // Reset activity timer on user interactions
  useEffect(() => {
    const resetActivityTimer = () => {
      if (settings?.privacy.autoLogout && settings.privacy.autoLogout > 0) {
        setupAutoLogout(settings.privacy.autoLogout);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimer, true);
      });
    };
  }, [settings?.privacy.autoLogout]);

  // Theme application is now handled by ThemeProvider listening for 'app:theme-sync' event.

  const setupAutoLogout = (minutes: number) => {
    clearAutoLogout();
    const timer = setTimeout(() => {
      logout();
      // You might want to show a warning before logging out
    }, minutes * 60 * 1000);
    setLogoutTimer(timer);
  };

  const clearAutoLogout = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  const refreshSettings = async () => {
    if (isFetchingSettings) return;

    try {
      // Zero-Get Guard: Try persistent cache first
      if (persistentSettingsCache) {
        console.log('SettingsProvider: Using persistent session cache (Zero GET)');
        setSettings(persistentSettingsCache);
        setLoading(false);
        return;
      }

      isFetchingSettings = true;
      setLoading(true);
      const response = await api.settings.getAll();
      if (response.ok) {
        const data = await response.json();
        const settingsData = data.data;
        persistentSettingsCache = settingsData;
        setSettings(settingsData);
      } else {
        // Use default settings if API fails
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
      isFetchingSettings = false;
    }
  };

  const updateSettings = async (section: string, newSettings: any) => {
    try {
      const response = await api.settings.update(section.toLowerCase(), newSettings);
      if (response.ok) {
        const data = await response.json();
        const updatedSettings = data.data;
        
        persistentSettingsCache = updatedSettings;
        setSettings(updatedSettings);

        // MANUALLY apply to current session (Theme/Language)
        if (section.toLowerCase() === 'appearance' && updatedSettings.appearance?.theme) {
          window.dispatchEvent(new CustomEvent('app:theme-sync', { detail: updatedSettings.appearance.theme }));
        }

        if (section.toLowerCase() === 'general' && updatedSettings.general?.language) {
          const newLanguage = updatedSettings.general.language;
          if (newLanguage !== currentLocale) {
            router.replace(pathname, { locale: newLanguage });
          }
        }

      } else {
        const errorData = await response.json().catch(() => ({}));
        throw errorData;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const syncSettings = (update: { section: string; settings: any }) => {
    console.log('SYNC: Received external settings delta update', update);
    // For external sync, we update the data model (to reflect in Settings Page)
    // but the actual current UI theme/language will remain unchanged.
    setSettings((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        [update.section]: { ...prev[update.section], ...update.settings },
      };
    });

    // Also update localStorage so next refresh has the new values for theme
    // but DON'T dispatch theme-sync event (prevents flipping current UI for background sessions)
    if (typeof window !== 'undefined' && update.section === 'appearance' && update.settings.theme) {
      localStorage.setItem('theme', update.settings.theme);
    }
  };

  const getNotificationPreferences = () => {
    return {
      email: settings?.notifications.emailNotifications ?? true,
      push: settings?.notifications.pushNotifications ?? true,
    };
  };

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    refreshSettings,
    syncSettings,
    getNotificationPreferences,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};