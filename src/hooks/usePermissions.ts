'use client';

import { useAuthStore } from '@/lib/store';
import { useMemo } from 'react';
import { PERMISSIONS, PermissionValue } from '@/constants/permissions';

/**
 * Hook to check if the current user has a specific permission.
 * Supports granular permission strings AND the 'all' (Master Admin) permission.
 */
export const usePermissions = () => {
    const { user } = useAuthStore();

    const permissions = useMemo(() => {
        // user?.userType?.permissions should be an array of strings
        if (!user || !user.userType || !Array.isArray(user.userType.permissions)) {
            return [];
        }
        return user.userType.permissions;
    }, [user]);

    const hasPermission = (permission: PermissionValue): boolean => {
        if (!user) return false;
        
        // Master Admin or System Role Check
        if (permissions.includes(PERMISSIONS.SUPER_ADMIN)) return true;
        
        // Literal permission check
        return permissions.includes(permission);
    };

    /**
     * Check if user has ANY of the provided permissions
     */
    const hasAnyPermission = (requiredPermissions: PermissionValue[]): boolean => {
        if (!user) return false;
        if (permissions.includes(PERMISSIONS.SUPER_ADMIN)) return true;
        return requiredPermissions.some(p => permissions.includes(p));
    };

    /**
     * Check if user has ALL of the provided permissions
     */
    const hasAllPermissions = (requiredPermissions: PermissionValue[]): boolean => {
        if (!user) return false;
        if (permissions.includes(PERMISSIONS.SUPER_ADMIN)) return true;
        return requiredPermissions.every(p => permissions.includes(p));
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        // Helper to check if user is a system master role
        isSystemAdmin: permissions.includes(PERMISSIONS.SUPER_ADMIN)
    };
};
