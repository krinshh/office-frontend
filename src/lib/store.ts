import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  userType: any; // Can be string ID or populated object
  office?: any; // Office object or ID
  joiningDate?: string;
  shiftTimings?: {
    start: string;
    end: string;
  };
  accountDetails?: {
    name: string;
    ifsc: string;
    accountNumber: string;
    upiId: string;
  };
  photo?: string;
  ctc?: number;
  baseSalary?: number;
  ta?: number;
  VPF?: number;
  oneTimeJoiningBonus?: number;
  gratuity?: number;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  updateUserData: (updatedUser: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Set cookie for middleware (7 days expiry)
        if (typeof document !== 'undefined') {
          document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
        }
        set({ user, token, isAuthenticated: true });
      },
      updateUserData: (updatedUser) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updatedUser } : null 
      })),
      logout: () => {
        // Remove cookie for middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, token: state.token }), // Persist token indicator for Zero GET stability
    }
  )
);