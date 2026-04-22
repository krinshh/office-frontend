'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Menu from 'lucide-react/dist/esm/icons/menu';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import User from 'lucide-react/dist/esm/icons/user';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { getPhotoUrl } from '@/utils/formatters';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = React.memo(({ onMenuClick, title }) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { hasAnyPermission } = usePermissions();

  const isManagement = hasAnyPermission([
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.OFFICES_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.SALARY_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.GLOBAL_CONFIG_MANAGE
  ]);

  const accentColor = isManagement ? 'text-primary' : 'text-secondary';
  const accentBg = isManagement ? 'bg-primary/10' : 'bg-secondary/10';

  const handleLogout = async () => {
    try {
      // 1. Tell backend to clear session
      await api.auth.logout();
    } catch (err) {
      console.error('Logout API failed, forcing local cleanup');
    }

    // 2. Use centralized store logout (clears state and cookie)
    logout();

    // 3. Optional: Clear theme-preserving storage
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) localStorage.setItem('theme', theme);
    sessionStorage.clear();

    // 4. Localized redirect to login
    // Using simple href with locale ensures a clean break from old contexts
    window.location.href = `/${locale}/login`; 
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-40 bg-card/80 backdrop-blur-md transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 p-0 flex items-center justify-center"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 shrink-0" />
          </Button>

          {title && (
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {title}
              </h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center">
            <NotificationBell variant={isManagement ? 'primary' : 'secondary'} />
          </div>

          <div className="h-9 flex items-center">
            <ThemeToggle />
          </div>

          <div className="h-9 flex items-center">
            <LanguageSwitcher variant={isManagement ? 'primary' : 'secondary'} />
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm h-9">
            <div className="flex items-center gap-2">
            <div className={`w-9 h-9 ${accentBg} rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-sm border border-border`}>
              {user?.photo ? (
                <img
                  src={getPhotoUrl(user.photo, (user as any).updatedAt)}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className={`w-5 h-5 ${accentColor} transition-colors duration-300`} />
              )}
            </div>
              <div className="hidden lg:block">
                <p className="font-medium text-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {typeof user?.userType === 'object' ? user?.userType?.name : user?.userType || 'User'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 h-9">
            <Button
              variant={isManagement ? 'outline' : 'outline2'}
              className="h-9 w-9 p-0 flex items-center justify-center"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
            </Button>

            <Button
              variant={isManagement ? 'outline' : 'outline2'}
              className="h-9 w-9 p-0 flex items-center justify-center"
              size="sm"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;