'use client';

import React from 'react';
import Link from './Link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNotificationStore } from '@/lib/notificationStore';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Users from 'lucide-react/dist/esm/icons/users';
import Building from 'lucide-react/dist/esm/icons/building';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Shield from 'lucide-react/dist/esm/icons/shield';
import User from 'lucide-react/dist/esm/icons/user';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import X from 'lucide-react/dist/esm/icons/x';
import Button from './Button';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userType?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: keyof typeof PERMISSIONS;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ isOpen, onToggle, userType = 'User' }) => {
  const pathname = usePathname();
  const t = useTranslations();
  const { hasPermission } = usePermissions();

  const { unreadCount } = useNotificationStore();

  const navigationItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('sidebar.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/users',
      label: t('sidebar.users'),
      icon: Users,
      requiredPermission: 'USERS_VIEW',
    },
    {
      href: '/dashboard/offices',
      label: t('sidebar.offices'),
      icon: Building,
      requiredPermission: 'OFFICES_MANAGE',
    },
    {
      href: '/dashboard/attendance',
      label: t('sidebar.attendance'),
      icon: Calendar,
      requiredPermission: 'ATTENDANCE_VIEW_ALL',
    },
    {
      href: '/dashboard/tasks',
      label: t('sidebar.tasks'),
      icon: CheckSquare,
      // Tasks dashboard is for management (View All)
      requiredPermission: 'TASKS_VIEW_ALL',
    },
    {
      href: '/dashboard/salary',
      label: t('sidebar.salary'),
      icon: IndianRupee,
      requiredPermission: 'SALARY_VIEW_ALL',
    },
    {
      href: '/dashboard/reports',
      label: t('sidebar.reports'),
      icon: BarChart3,
      requiredPermission: 'REPORTS_VIEW',
    },
    {
      href: '/dashboard/audit',
      label: t('sidebar.auditLog'),
      icon: Shield,
      requiredPermission: 'AUDIT_LOGS_VIEW',
    },
    {
      href: '/dashboard/global-config',
      label: t('sidebar.globalConfig'),
      icon: Settings,
      requiredPermission: 'GLOBAL_CONFIG_MANAGE',
    },
  ];

  const userItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('sidebar.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/user/attendance',
      label: t('sidebar.attendance'),
      icon: Calendar,
    },
    {
      href: '/user/profile',
      label: t('sidebar.profile'),
      icon: User,
    },
    {
      href: '/user/tasks',
      label: t('sidebar.tasks'),
      icon: CheckSquare,
    },
    {
      href: '/user/salary',
      label: t('sidebar.salary'),
      icon: IndianRupee,
    },
    {
      href: '/dashboard/notifications',
      label: t('sidebar.notifications'),
      icon: Bell,
    },
    {
      href: '/dashboard/settings',
      label: t('sidebar.settings'),
      icon: Settings,
    },
  ];

  const filteredItems = React.useMemo(() =>
    navigationItems.filter(item => !item.requiredPermission || hasPermission(PERMISSIONS[item.requiredPermission])),
    [navigationItems, hasPermission]);

  const isManagement = React.useMemo(() => filteredItems.length > 1, [filteredItems]);
  const accentColor = isManagement ? 'text-primary' : 'text-secondary';
  const accentBg = isManagement ? 'bg-primary' : 'bg-secondary';

  const isActive = React.useCallback((href: string) => {
    if (href === '/dashboard') {
      return pathname === '/en/dashboard' || pathname === '/hi/dashboard' || pathname === '/gu/dashboard';
    }
    return pathname.includes(href);
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:fixed lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-9 h-9 ${accentBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300`}>
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-foreground truncate">
                  {t('sidebar.appTitle')}
                </h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="h-9 w-9 lg:hidden flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 shrink-0" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-2">
              {/* Dashboard Navigation */}
              {isManagement && (
                <div className="mb-6">
                  <h2 className="px-3 text-xl font-semibold text-primary uppercase tracking-wider mb-2">
                    {t('sidebar.generalSection')}
                  </h2>
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return active ? (
                        <span
                          key={item.href}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${active
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                          />
                          <div className="flex-1 flex items-center justify-between">
                            {item.label}
                            {item.href.includes('notifications') && unreadCount > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>

                        </span>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          aria-current={active ? "page" : undefined}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              onToggle();
                            }
                          }}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${active
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                          />
                          <div className="flex-1 flex items-center justify-between">
                            {item.label}
                            {item.href.includes('notifications') && unreadCount > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>

                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Navigation */}
              {navigationItems.filter(item => !item.requiredPermission).length > 0 && (
                <div>
                  <h2 className="px-3 text-xl font-semibold text-secondary uppercase tracking-wider mb-2">
                    {t('sidebar.myAccountSection')}
                  </h2>
                  <div className="space-y-1">
                    {userItems.filter(item => {
                      // If Dashboard, only show it in My Account if the Top Dashboard section is hidden
                      if (item.href === '/dashboard' && isManagement) return false;

                      // Special logic: If dashboard/attendance/salary/tasks, check if user has management permission
                      // If they DON'T have management permission, show the User-specific page in this section
                      if (item.href === '/dashboard/attendance' && hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL)) return false;
                      if (item.href === '/dashboard/salary' && hasPermission(PERMISSIONS.SALARY_VIEW_ALL)) return false;
                      if (item.href === '/dashboard/tasks' && hasPermission(PERMISSIONS.TASKS_VIEW_ALL)) return false;
                      return true;
                    }).map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return active ? (
                        <span
                          key={item.href}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                            ? 'bg-secondary text-secondary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${active
                              ? 'text-secondary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                          />
                          <div className="flex-1 flex items-center justify-between">
                            {item.label}
                            {item.href.includes('notifications') && unreadCount > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>

                        </span>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                            ? 'bg-secondary text-secondary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              onToggle();
                            }
                          }}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors ${active
                              ? 'text-secondary-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                          />
                          <div className="flex-1 flex items-center justify-between">
                            {item.label}
                            {item.href.includes('notifications') && unreadCount > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>

                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground text-center">
              {t('sidebar.footer')}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;