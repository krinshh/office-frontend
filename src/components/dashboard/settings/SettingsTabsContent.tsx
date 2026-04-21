'use client';

import Globe from 'lucide-react/dist/esm/icons/globe';
import Palette from 'lucide-react/dist/esm/icons/palette';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Moon from 'lucide-react/dist/esm/icons/moon';
import Sun from 'lucide-react/dist/esm/icons/sun';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import Save from 'lucide-react/dist/esm/icons/save';
import { FormField, Button } from '@/components';

interface SettingsItemProps {
  activeTab: string;
  localSettings: any;
  updateLocalSetting: (section: any, key: string, value: any) => void;
  handleNotificationChange: (key: string, value: boolean) => void;
  setLocalSettings: (settings: any) => void;
  loading: boolean;
  handleSave: (section: string) => void;
  t: any;
}

export function SettingsTabsContent({
  activeTab,
  localSettings,
  updateLocalSetting,
  handleNotificationChange,
  setLocalSettings,
  loading,
  handleSave,
  t
}: SettingsItemProps) {

  if (activeTab === 'general') {
    return (
      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex items-center mb-6 lg:mb-8 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Globe className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{t('settings.sections.generalPreferences')}</h2>
            <p className="text-muted-foreground text-sm">{t('settings.sections.generalPreferencesDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 ">{t('settings.sections.languageRegion')}</h3>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">{t('settings.labels.language')}</label>
              <div className="space-y-2">
                {[
                  { value: 'en', label: 'English', flag: '🇺🇸' },
                  { value: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
                  { value: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' }
                ].map((lang) => (
                  <label key={lang.value} className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="language"
                      value={lang.value}
                      checked={localSettings.general.language === lang.value}
                      onChange={(e) => updateLocalSetting('general', 'language', e.target.value)}
                      className="mr-3 accent-secondary/90 focus:ring-secondary/90"
                    />
                    <span className="text-foreground">{lang.flag} {lang.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 md:pt-6 border-t border-border">
          <Button
            variant='secondary'
            onClick={() => handleSave('General')}
            disabled={loading}
            className="disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full md:w-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('settings.buttons.saveChanges')}
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === 'appearance') {
    return (
      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex items-center mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Palette className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{t('settings.sections.appearance')}</h2>
            <p className="text-muted-foreground text-sm">{t('settings.sections.appearanceDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.sections.theme')}</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={localSettings.appearance.theme === 'dark'}
                  onChange={(e) => updateLocalSetting('appearance', 'theme', e.target.value)}
                  className="mr-3 accent-secondary/90 focus:ring-secondary/90"
                />
                <Moon className="w-5 h-5 mr-3 text-primary/90" />
                <span className="text-foreground">{t('settings.labels.darkTheme')}</span>
              </label>
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={localSettings.appearance.theme === 'light'}
                  onChange={(e) => updateLocalSetting('appearance', 'theme', e.target.value)}
                  className="mr-3 accent-secondary/90 focus:ring-secondary/90"
                />
                <Sun className="w-5 h-5 mr-3 text-warning/90" />
                <span className="text-foreground">{t('settings.labels.lightTheme')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 md:pt-6 border-t border-border">
          <Button
            variant='secondary'
            onClick={() => handleSave('Appearance')}
            disabled={loading}
            className="disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full md:w-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('settings.buttons.saveChanges')}
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return (
      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        <div className="flex items-center mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Bell className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{t('settings.sections.notifications')}</h2>
            <p className="text-muted-foreground text-sm">{t('settings.sections.notificationsDesc')}</p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.sections.systemNotifications')}</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.salaryAlerts}
                  onChange={(e) => handleNotificationChange('salaryAlerts', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-5 h-5 text-secondary" />
                  <span className="text-foreground">{t('settings.labels.salaryGenerationAlerts')}</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.sections.taskNotifications')}</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.taskAssignment}
                  onChange={(e) => handleNotificationChange('taskAssignment', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{t('settings.labels.taskAssignments')}</span>
                </div>
              </label>
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.attendanceReminders}
                  onChange={(e) => handleNotificationChange('attendanceReminders', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-foreground">{t('settings.labels.taskDueReminders')}</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('settings.sections.deliveryMethods')}</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{t('settings.labels.emailNotifications')}</span>
                </div>
              </label>
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.pushNotifications}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <span className="text-foreground">{t('settings.labels.pushNotifications')}</span>
                </div>
              </label>
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.liveNotifications}
                  onChange={(e) => handleNotificationChange('liveNotifications', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-foreground">{t('settings.labels.liveNotifications') || "Real-time Popups (Live)"}</span>
                </div>
              </label>
              <label className="flex items-center p-3 bg-card border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.notifications.soundNotifications}
                  onChange={(e) => handleNotificationChange('soundNotifications', e.target.checked)}
                  className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{t('settings.labels.soundNotifications') || "Notification Sounds"}</span>
                </div>
              </label>
            </div>

            <div className="space-y-4 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.labels.quietHours')}</h4>
                    <p className="text-sm text-text-secondary">{t('settings.sections.notificationsDesc')}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications.quietHours.enabled}
                    onChange={(e) => {
                      setLocalSettings({
                        ...localSettings,
                        notifications: {
                          ...localSettings.notifications,
                          quietHours: {
                            ...localSettings.notifications.quietHours,
                            enabled: e.target.checked
                          }
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {localSettings.notifications.quietHours.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormField
                    label={t('settings.labels.quietHoursStart')}
                    name="quietHoursStart"
                    type="time"
                    value={localSettings.notifications.quietHours.start}
                    onChange={(e) => {
                      setLocalSettings({
                        ...localSettings,
                        notifications: {
                          ...localSettings.notifications,
                          quietHours: {
                            ...localSettings.notifications.quietHours,
                            start: e.target.value
                          }
                        }
                      });
                    }}
                  />
                  <FormField
                    label={t('settings.labels.quietHoursEnd')}
                    name="quietHoursEnd"
                    type="time"
                    value={localSettings.notifications.quietHours.end}
                    onChange={(e) => {
                      setLocalSettings({
                        ...localSettings,
                        notifications: {
                          ...localSettings.notifications,
                          quietHours: {
                            ...localSettings.notifications.quietHours,
                            end: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 md:pt-6 border-t border-border">
          <Button
            onClick={() => handleSave('Notifications')}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full md:w-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('settings.buttons.saveChanges')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
