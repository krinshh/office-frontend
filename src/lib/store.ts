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
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUserData: (updatedUser) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updatedUser } : null 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, token: state.token }), // Persist token indicator for Zero GET stability
    }
  )
);