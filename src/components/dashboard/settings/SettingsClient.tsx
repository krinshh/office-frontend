'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/components';
import { useSettings } from '@/lib/settingsContext';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Bell from 'lucide-react/dist/esm/icons/bell';
import { useTranslations } from 'next-intl';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { SettingsTabsContent } from './SettingsTabsContent';

export function SettingsClient() {
  const t = useTranslations();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess: setSuccessMsg
  } = useErrorHandler(t);

  // Local state for form management
  const [localSettings, setLocalSettings] = useState({
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
    }
  });

  // Sync local state with context changes
  useEffect(() => {
    if (settings) {
      setLocalSettings(prev => {
        const next = { ...prev };
        let changed = false;

        if (settings.general && JSON.stringify(settings.general) !== JSON.stringify(prev.general)) {
          next.general = { ...settings.general };
          changed = true;
        }
        if (settings.appearance && JSON.stringify(settings.appearance) !== JSON.stringify(prev.appearance)) {
          next.appearance = { ...settings.appearance };
          changed = true;
        }
        if (settings.notifications && JSON.stringify(settings.notifications) !== JSON.stringify(prev.notifications)) {
          next.notifications = { ...settings.notifications };
          changed = true;
        }
        if (settings.privacy && JSON.stringify(settings.privacy) !== JSON.stringify(prev.privacy)) {
          next.privacy = { ...settings.privacy };
          changed = true;
        }

        return changed ? next : prev;
      });
    }
  }, [settings]);

  const updateLocalSetting = (section: keyof typeof localSettings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: t('settings.tabs.general'), icon: Settings },
    { id: 'appearance', label: t('settings.tabs.appearance'), icon: Palette },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    updateLocalSetting('notifications', key, value);
  };

  const handleSave = async (section: string) => {
    setLoading(true);
    clearErrors();

    try {
      const settingsToUpdate = localSettings[section.toLowerCase() as keyof typeof localSettings];
      await updateSettings(section.toLowerCase(), settingsToUpdate);
      handleSuccess(t('settings.success.settingsSaved', { section }));
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      handleError(err, t('settings.errors.failedToSaveSettings'));
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Tab Navigation */}
      <div className="bg-card backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 flex-shrink-0 ${activeTab === tab.id
                  ? 'text-secondary border-secondary bg-secondary/10'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 md:p-6">
          <SettingsTabsContent
            activeTab={activeTab}
            localSettings={localSettings}
            updateLocalSetting={updateLocalSetting}
            handleNotificationChange={handleNotificationChange}
            setLocalSettings={setLocalSettings}
            loading={loading}
            handleSave={handleSave}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
