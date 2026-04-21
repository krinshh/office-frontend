

import { useAuthStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return useAuthStore.getState().token;
  }
  return null;
};

// Reads the csrf_token cookie set by the server
export const getCsrfToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
};

// Ensures a CSRF cookie exists before a state-changing auth request
export const ensureCsrf = async (force = false): Promise<void> => {
  if (force || !getCsrfToken()) {
    await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' });
  }
};

// Centralized "Hard Reset" ensures no "Ghost" dashboard states are ever rendered.
// It bypasses the React/Zustand state update entirely in favor of a full browser reload.
// Centralized "Hard Reset" ensures no "Ghost" dashboard states are ever rendered.
// It bypasses the React/Zustand state update entirely in favor of a full browser reload.
const performHardLogout = async () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isLoginPage = pathname.includes('/login');
      const isRecoveryPage = pathname.includes('/forgot-password') || pathname.includes('/reset-password');
      // Check for exact root or localized variants (e.g., /, /en, /en/)
      const isRootPage = pathname === '/' || /^\/(en|hi|gu)(\/)?$/.test(pathname);
      
      if (!isLoginPage && !isRootPage && !isRecoveryPage) {
        // 1. SILENTLY tell backend to clear cookie (fire and forget)
        try {
          await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (e) {}

        // 2. Clear all local storage
        const theme = localStorage.getItem('theme');
        localStorage.clear();
        if (theme) localStorage.setItem('theme', theme);
        sessionStorage.clear();
        
        // 3. Force browser reset to landing
        window.location.replace('/');
      }
    }
};

// Helper to add standard headers and credentials
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const authHeader: HeadersInit = token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {};

  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const csrfHeader: HeadersInit = isStateChanging ? { 'x-csrf-token': getCsrfToken() } : {};

  const isFormData = options.body instanceof FormData;
  
  // For FormData, we must NOT set Content-Type (fetch does it automatically with boundary)
  // For JSON/other, we merge existing headers with Auth and CSRF
  const headers = isFormData
    ? { ...authHeader, ...csrfHeader }
    : { ...(options.headers || {}), ...authHeader, ...csrfHeader };

  const response = await fetch(url, {
    ...options,
    headers: headers as any,
    credentials: 'include',
  }).catch(async (error) => {
    // Network errors (backend down or restarting)
    await performHardLogout();
    throw error;
  });

  // Handle unauthorized (401) globally
  if (response.status === 401) {
    await performHardLogout();
  }

  // Handle CSRF Error (403) globally - Automatic Refresh & Retry
  if (response.status === 403) {
    const errorData = await response.clone().json().catch(() => ({}));
    if (errorData.code === 'CSRF_ERROR' && (options as any)._retry !== true) {
      // 1. Force refresh the token from the server
      await ensureCsrf(true);
      // 2. Retry the original request exactly once
      return fetchWithAuth(url, { ...options, _retry: true } as any);
    }
  }

  return response;
};

export const api = {
  push: {
    getPublicKey: () => fetch(`${API_BASE}/api/push/public-key`),
    subscribe: (subscription: any) =>
      fetchWithAuth(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      }),
  },
  auth: {
    sendOTP: async (email: string) => {
      await ensureCsrf();
      return fetchWithAuth(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    },
    verifyOTP: async (email: string, otp: string) => {
      await ensureCsrf();
      return fetchWithAuth(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
    },
    logout: async () => {
        await ensureCsrf();
        return fetchWithAuth(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
    },
    getMe: () => fetchWithAuth(`${API_BASE}/api/auth/me`),
  },
  users: {
    getAll: (params?: any) => {
      const url = new URL(`${API_BASE}/api/users`);
      if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      }
      return fetchWithAuth(url.toString());
    },
    getById: (id: string) => fetchWithAuth(`${API_BASE}/api/users/${id}`),
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      const options: RequestInit = { method: 'POST', body: isFormData ? data : JSON.stringify(data) };
      if (!isFormData) options.headers = { 'Content-Type': 'application/json' };
      return fetchWithAuth(`${API_BASE}/api/users`, options);
    },
    update: (id: string, data: any) => {
      const isFormData = data instanceof FormData;
      const options: RequestInit = { method: 'PUT', body: isFormData ? data : JSON.stringify(data) };
      if (!isFormData) options.headers = { 'Content-Type': 'application/json' };
      return fetchWithAuth(`${API_BASE}/api/users/${id}`, options);
    },
    updateProfile: (data: any) => {
      const isFormData = data instanceof FormData;
      const options: RequestInit = { method: 'PUT', body: isFormData ? data : JSON.stringify(data) };
      if (!isFormData) options.headers = { 'Content-Type': 'application/json' };
      return fetchWithAuth(`${API_BASE}/api/users/profile`, options);
    },
    delete: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
      }),
    getTypes: (params?: any) => {
      const url = new URL(`${API_BASE}/api/users/types`);
      if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      }
      return fetchWithAuth(url.toString());
    },
    createType: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/users/types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateType: (id: string, data: any) =>
      fetchWithAuth(`${API_BASE}/api/users/types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    deleteType: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/users/types/${id}`, {
        method: 'DELETE',
      }),
  },
  offices: {
    getAll: (params?: any) => {
      const url = new URL(`${API_BASE}/api/offices`);
      if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      }
      return fetchWithAuth(url.toString());
    },
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth(`${API_BASE}/api/offices`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    update: (id: string, data: any) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth(`${API_BASE}/api/offices/${id}`, {
        method: 'PUT',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    delete: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/offices/${id}`, {
        method: 'DELETE',
      }),
  },
  tasks: {
    getAll: () => fetchWithAuth(`${API_BASE}/api/tasks`),
    create: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchWithAuth(`${API_BASE}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/tasks/${id}`, {
        method: 'DELETE',
      }),
    getAssignments: (params?: any) => {
      const url = new URL(`${API_BASE}/api/tasks/assignments`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });
      }
      return fetchWithAuth(url.toString());
    },
    getAssignmentStats: (params: any) => {
      const url = new URL(`${API_BASE}/api/tasks/assignment-stats`);
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
      return fetchWithAuth(url.toString());
    },
    assign: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/tasks/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateAssignmentStatus: (id: string, data: any) =>
      fetchWithAuth(`${API_BASE}/api/tasks/assignments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  attendance: {
    markIn: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/attendance/in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, date: new Date().toISOString().split('T')[0] }),
      }),
    markOut: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/attendance/out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, date: new Date().toISOString().split('T')[0] }),
      }),
    getAll: (params?: any) => {
      const url = new URL(`${API_BASE}/api/attendance/all`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });
      }
      return fetchWithAuth(url.toString());
    },
    getMine: (params?: any) => {
      const url = new URL(`${API_BASE}/api/attendance`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });
      }
      return fetchWithAuth(url.toString());
    },
    getLivePresence: () => fetchWithAuth(`${API_BASE}/api/attendance/live`),
    getStats: (params?: any) => {
      const url = new URL(`${API_BASE}/api/attendance/stats`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });
      }
      return fetchWithAuth(url.toString());
    },
    getMonthly: (params: any) => {
      const url = new URL(`${API_BASE}/api/attendance/monthly`);
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
      return fetchWithAuth(url.toString());
    },
    getMonthlyCount: (params: any) => {
      const url = new URL(`${API_BASE}/api/attendance/monthly-count`);
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
      return fetchWithAuth(url.toString());
    },
  },
  salary: {
    generate: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/salary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    getAll: () => fetchWithAuth(`${API_BASE}/api/salary`),
    getAllSalaries: () => fetchWithAuth(`${API_BASE}/api/salary/all`),
    getById: (id: string) => fetchWithAuth(`${API_BASE}/api/salary/${id}`),
    downloadCSV: (params: any) => {
      const url = new URL(`${API_BASE}/api/salary/download/csv`);
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
      return fetchWithAuth(url.toString());
    },
  },
  globalConfig: {
    get: () => fetchWithAuth(`${API_BASE}/api/global-config`),
    update: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/global-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    getHRASlabs: () => fetchWithAuth(`${API_BASE}/api/global-config/hra-slabs`),
    createHRASlab: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/global-config/hra-slabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateHRASlab: (id: string, data: any) =>
      fetchWithAuth(`${API_BASE}/api/global-config/hra-slabs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    deleteHRASlab: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/global-config/hra-slabs/${id}`, {
        method: 'DELETE',
      }),
  },
  notifications: {
    getAll: () => fetchWithAuth(`${API_BASE}/api/notifications`),
    getUnreadCount: () => fetchWithAuth(`${API_BASE}/api/notifications/unread-count`),
    markAsRead: (id: string) =>
      fetchWithAuth(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    markAllAsRead: () =>
      fetchWithAuth(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
  },
  settings: {
    getAll: () => fetchWithAuth(`${API_BASE}/api/settings`),
    update: (section: string, settings: any) =>
      fetchWithAuth(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, settings }),
      }),
    reset: (section: string) =>
      fetchWithAuth(`${API_BASE}/api/settings/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      }),
    getDefaults: () => fetchWithAuth(`${API_BASE}/api/settings/defaults`),
  },
  audit: {
    getLogs: (params?: any) => {
      const url = new URL(`${API_BASE}/api/audit`);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });
      }
      return fetchWithAuth(url.toString());
    },
  },
  pdfs: {
    generateAttendanceReport: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/pdfs/attendance-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    generateTaskReport: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/pdfs/task-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    generateSalaryReport: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/pdfs/salary-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    generateSalarySlip: (data: any) =>
      fetchWithAuth(`${API_BASE}/api/pdfs/salary-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
};