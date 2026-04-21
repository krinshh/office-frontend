'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import SearchInput from '@/components/SearchInput';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Settings from 'lucide-react/dist/esm/icons/settings';

interface UsersHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canManageRoles: boolean;
  hasCreatePermission: boolean;
  setShowRolesListModal: (show: boolean) => void;
  setShowUserModal: (show: boolean) => void;
  setEditingUser: (user: any | null) => void;
}

export const UsersHeader = ({
  searchQuery,
  setSearchQuery,
  canManageRoles,
  hasCreatePermission,
  setShowRolesListModal,
  setShowUserModal,
  setEditingUser
}: UsersHeaderProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-shrink-0 whitespace-nowrap">
        <h1 className="text-2xl font-bold text-foreground overflow-hidden text-ellipsis leading-none pb-1 capitalize">
          {t('users.title')}
        </h1>
        <p className="text-muted-foreground overflow-hidden text-ellipsis leading-none pb-1">
          {t('users.subtitle')}
        </p>
      </div>

      <div className="flex-grow hidden sm:block" />

      <div className="flex flex-wrap items-center gap-3 gap-x-4 w-full sm:w-auto">
        <div className="w-full md:w-auto md:min-w-[150px] md:max-w-[180px] flex-shrink-0">
          <SearchInput
            id="user-search-query"
            name="user-search-query"
            placeholder={t('users.form.searchPlaceholder') || 'Search users...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputSize="sm"
            fullWidth={false}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-nowrap gap-x-4 w-full md:w-auto">
          {canManageRoles && (
            <Button
              onClick={() => setShowRolesListModal(true)}
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap w-full md:w-auto"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">
                {t('users.manageRoles') || 'Manage Roles'}
              </span>
              <span className="text-sm sm:hidden">{t('users.type')}</span>
            </Button>
          )}

          {hasCreatePermission && (
            <Button
              onClick={() => {
                setEditingUser(null);
                setShowUserModal(true);
              }}
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">{t('users.addUser')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
