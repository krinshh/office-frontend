'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Loading from '@/components/Loading';
import UserCard from '@/components/UserCard';
import { EmptyUsers } from '@/components/EmptyState';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { VALID_REGEX } from '@/constants/regex';

import { UsersHeader } from './UsersHeader';
import { UsersGridSkeleton, UserFormSkeleton, UserViewSkeleton, UserTypeSkeleton } from './UsersSkeleton';

const UserFormModalContent = dynamic(() => import('./UserFormModalContent').then(m => m.UserFormModalContent), {
  loading: () => <UserFormSkeleton />
});

const UserViewModalContent = dynamic(() => import('./UserViewModalContent').then(m => m.UserViewModalContent), {
  loading: () => <UserViewSkeleton />
});

const UserTypeModalContent = dynamic(() => import('./UserTypeModalContent').then(m => m.UserTypeModalContent), {
  loading: () => <UserTypeSkeleton />
});

const Modal = dynamic(() => import('@/components/Modal'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted/20 rounded-lg animate-pulse" />,
});

interface UserType {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isDeletable?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  userType?: { name: string };
  office?: { name: string };
}

interface FullUser extends User {
  username?: string;
  office?: any;
  photo?: string;
  address?: string;
  joiningDate: string;
  ctc: number;
  baseSalary: number;
  ta?: number;
  TA?: number;
  oneTimeJoiningBonus: number;
  vpf?: number;
  VPF?: number;
  gratuity: number;
}

export function UsersClient() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.USERS_VIEW);
  const canManageRoles = hasPermission(PERMISSIONS.USER_TYPES_MANAGE);

  const {
    offices,
    userTypes,
    users,
    fetchOffices,
    fetchUserTypes,
    fetchUsers,
    addOrUpdateUser,
    addOrUpdateUserType,
    removeUser,
    removeUserType,
    isFetching
  } = useAppStore();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  
  const editingUser = useMemo(() => (users as any[]).find((u) => u._id === editingUserId) as FullUser | null, [users, editingUserId]);
  const viewingUser = useMemo(() => (users as any[]).find((u) => u._id === viewingUserId) as FullUser | null, [users, viewingUserId]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showRolesListModal, setShowRolesListModal] = useState(false);
  const [editingUserType, setEditingUserType] = useState<UserType | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    errors,
    success,
    handleError,
    clearErrors,
    setErrors,
    setSuccess
  } = useErrorHandler(t);

  const lastUserElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisibleCount(prev => prev + 20);
    });
    if (node) observer.current.observe(node);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setVisibleCount(20);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    if (users.length > 0 && offices.length > 0 && userTypes.length > 0) return;
    try {
      await Promise.all([fetchUserTypes(), fetchOffices(), fetchUsers()]);
    } catch (err) {
      handleError(err, t('users.errors.failedToLoad'));
    }
  };

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/dashboard');
    } else if (user) {
      fetchData();
    }
  }, [user, isAdmin, router]);

  const handleUserTypeSubmit = async (formData: { name: string; description: string; permissions: string[] }) => {
    setSubmitting(true);
    const newErrors: Record<string, string> = {};
    if (!VALID_REGEX.ONLY_ALPHABETS.test(formData.name.trim())) newErrors.name = t('users.validation.roleNameInvalid');
    if (!formData.description.trim()) newErrors.description = t('users.validation.descriptionRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      const response = editingUserType
        ? await api.users.updateType(editingUserType._id, formData)
        : await api.users.createType(formData);

      if (response.ok) {
        const result = await response.json();
        const newType = result.userType || result;
        setSuccess(editingUserType ? t('users.success.userTypeUpdated') : t('users.success.userTypeCreated'));
        setShowUserTypeModal(false);
        setEditingUserType(null);
        setShowRolesListModal(true);
        addOrUpdateUserType(newType);
      } else {
        handleError(await response.json().catch(() => ({})), editingUserType ? t('users.errors.failedToUpdateUserType') : t('users.errors.failedToCreateUserType'));
      }
    } catch (err) {
      handleError(err, t('users.errors.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (user: User) => {
    try {
      const response = await api.users.delete(user._id);
      if (response.ok) {
        removeUser(user._id);
        setSuccess(t('users.success.userDeactivated'));
      } else {
        handleError(await response.json().catch(() => ({})), t('users.errors.failedToSave'));
      }
    } catch (err) {
      handleError(err, t('users.errors.networkError'));
    }
  };

  const handleDeleteUserType = async (typeId: string) => {
    try {
      const response = await api.users.deleteType(typeId);
      if (response.ok) {
        removeUserType(typeId);
        setSuccess(t('users.success.userTypeDeactivated'));
      } else {
        handleError(await response.json().catch(() => ({})), t('users.errors.failedToCreateUserType'));
      }
    } catch (err) {
      handleError(err, t('users.errors.networkError'));
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().replace(VALID_REGEX.WHITESPACE, '');
      result = result.filter((u: any) => {
        const dateObj = new Date(u.joiningDate || u.createdAt);
        const formattedDate = `Joined ${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`.toLowerCase().replace(VALID_REGEX.WHITESPACE, '');
        return (
          u.name.toLowerCase().replace(VALID_REGEX.WHITESPACE, '').includes(query) ||
          u.email.toLowerCase().replace(VALID_REGEX.WHITESPACE, '').includes(query) ||
          u.userType?.name?.toLowerCase().replace(VALID_REGEX.WHITESPACE, '').includes(query) ||
          u.mobile.includes(query) ||
          formattedDate.includes(query) ||
          (u.ctc?.toString() || "").includes(query) ||
          (u.office?.name?.toLowerCase().replace(VALID_REGEX.WHITESPACE, '') || "").includes(query)
        );
      });
    }
    return [...result].sort((a: any, b: any) => new Date(b.joiningDate || b.createdAt || 0).getTime() - new Date(a.joiningDate || a.createdAt || 0).getTime());
  }, [users, debouncedSearchQuery]);

  const userTypeOptions = userTypes.map(t => ({ value: t._id, label: t.name }));
  const officeOptions = offices.map(o => ({ value: o._id, label: o.name }));

  // If user is logged in but not an admin, show nothing while redirecting
  if (user && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <style>{`::-webkit-scrollbar { width: 0px; background: transparent; } * { scrollbar-width: none; }`}</style>

      <UsersHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        canManageRoles={canManageRoles}
        hasCreatePermission={hasPermission(PERMISSIONS.USERS_CREATE)}
        setShowRolesListModal={setShowRolesListModal}
        setShowUserModal={setShowUserModal}
        setEditingUser={(u) => setEditingUserId(u ? (u._id || (u as any).id) : null)}
      />

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {(isFetching.users && users.length === 0) ? (
        <UsersGridSkeleton />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 md:gap-6 lg:gap-8">
          {filteredUsers.slice(0, visibleCount).map((u: any) => (
            <UserCard
              key={u._id}
              user={{
                _id: u._id, name: u.name, email: u.email, mobile: u.mobile,
                userType: u.userType ? { name: u.userType.name } : undefined,
                office: u.office ? { name: u.office.name } : undefined,
                photo: u.photo,
                ctc: u.ctc, joiningDate: u.joiningDate, updatedAt: u.updatedAt
              }}
              onView={() => u._id && setViewingUserId(u._id)}
              onEdit={() => { u._id && setEditingUserId(u._id); setShowUserModal(true); }}
              onDelete={() => handleDeactivateUser(u)}
            />
          ))}
        </div>
      )}

      {filteredUsers.length > visibleCount && (
        <div ref={lastUserElementRef} className="flex justify-center py-6"><Loading type="spinner" /></div>
      )}

      {!isFetching.users && users.length === 0 && <EmptyUsers onAddUser={() => setShowUserModal(true)} />}

      <Modal isOpen={showUserModal} onClose={() => { setShowUserModal(false); setEditingUserId(null); }} title={editingUser ? t('users.editUser') : t('users.addNewUser')} size="lg" scrollable>
        <UserFormModalContent
          editingUser={editingUser}
          userTypeOptions={userTypeOptions}
          officeOptions={officeOptions}
          userTypes={userTypes}
          onClose={() => { setShowUserModal(false); setEditingUserId(null); }}
          onSuccess={(res) => {
            setSuccess(editingUserId ? t('users.success.userUpdated') : t('users.success.userCreated'));
            setShowUserModal(false);
            addOrUpdateUser(res?.user || res);
            setEditingUserId(null);
          }}
        />
      </Modal>

      <Modal isOpen={!!viewingUserId} onClose={() => setViewingUserId(null)} title={t('users.viewUser') || 'View Profile'} size="lg" scrollable>
        {viewingUser ? (
          <UserViewModalContent
            user={viewingUser}
            onEdit={() => {
              const id = viewingUser?._id;
              if (id) {
                setViewingUserId(null);
                setEditingUserId(id);
                setShowUserModal(true);
              }
            }}
            onDelete={() => {
              const u = viewingUser;
              if (u) {
                setViewingUserId(null);
                handleDeactivateUser(u);
              }
            }}
          />
        ) : null}
      </Modal>

      <Modal isOpen={showRolesListModal} onClose={() => setShowRolesListModal(false)} title={t('users.manageRoles') || 'Manage Roles'} size="md" scrollable>
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{t('users.form.userType')}s present in system</p>
            <Button size="sm" onClick={() => { setShowRolesListModal(false); setShowUserTypeModal(true); }} className="flex items-center justify-center">
              <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">{t('users.addNewUserType')}</span>
            </Button>
          </div>
          <div className="space-y-4">
            {userTypes.map((type) => (
              <div key={type._id} className="flex items-center justify-between gap-2 p-4 bg-card hover:bg-muted/30 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                    setEditingUserType(type);
                    setShowRolesListModal(false);
                    setShowUserTypeModal(true);
                  }} icon={Settings}><></></Button>
                  {type.isDeletable !== false && type.name !== 'Admin' && (
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteUserType(type._id)} icon={Trash2}><></></Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showUserTypeModal} onClose={() => { setShowUserTypeModal(false); setEditingUserType(null); setShowRolesListModal(true); }} title={editingUserType ? (t('users.editUserType') || 'Edit User Type') : t('users.addNewUserType')} size="md" scrollable>
        <UserTypeModalContent
          editingUserType={editingUserType}
          submitting={submitting}
          errors={errors}
          onCancel={() => { setShowUserTypeModal(false); setEditingUserType(null); setShowRolesListModal(true); }}
          onSubmit={handleUserTypeSubmit}
        />
      </Modal>
    </div>
  );
}
