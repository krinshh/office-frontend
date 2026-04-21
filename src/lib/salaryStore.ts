import { create } from 'zustand';
import { api } from './api';

export interface Salary {
  _id: string;
  user: any;
  month: number;
  year: number;
  baseSalary: number;
  ta: number;
  sa: number;
  da: number;
  hra: number;
  cca: number;
  overtimePay: number;
  esi: number;
  pf: number;
  vpf: number;
  incomeTax: number;
  cess: number;
  professionalTax: number;
  lateDeductions: number;
  absentDeductions: number;
  halfDayDeductions: number;
  totalSalary: number;
  payoutStatus: string;
  payoutId?: string;
  razorpayPaymentId?: string;
  accountDetails?: any;
  generatedAt: string;
  updatedAt: string; // Used for Timestamp Guard
}

interface SalaryState {
  salaries: Salary[];
  lastFetched: number | null;
  isAdminCache: boolean; // Tracking the scope of the cached data
  isStale: boolean;
  isFetching: boolean;
  setStale: (stale: boolean) => void;
  setSalaries: (salaries: Salary[], isAdmin?: boolean) => void;
  addOrUpdateSalary: (salary: Salary) => void;
  addMultipleSalaries: (salaries: Salary[]) => void;
  fetchSalaries: (force?: boolean, isAdmin?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useSalaryStore = create<SalaryState>((set, get) => ({
  salaries: [],
  lastFetched: null,
  isAdminCache: false,
  isStale: false,
  isFetching: false,
  setStale: (isStale) => set({ isStale }),
  setSalaries: (salaries, isAdmin = false) => set({ 
    salaries, 
    lastFetched: Date.now(), 
    isStale: false,
    isAdminCache: isAdmin 
  }),
  addOrUpdateSalary: (salary) => set((state) => {
    const existing = state.salaries.find(s => s._id === salary._id);
    if (existing) {
      // Timestamp Guard
      if (new Date(salary.updatedAt) <= new Date(existing.updatedAt)) return state;
      return { salaries: state.salaries.map(s => s._id === salary._id ? salary : s) };
    }
    return { salaries: [salary, ...state.salaries] };
  }),
  addMultipleSalaries: (newSalaries) => set((state) => {
    let updatedSalaries = [...state.salaries];
    newSalaries.forEach(newS => {
      const index = updatedSalaries.findIndex(s => s._id === newS._id);
      if (index !== -1) {
        // Timestamp Guard for batch updates
        if (new Date(newS.updatedAt) > new Date(updatedSalaries[index].updatedAt)) {
          updatedSalaries[index] = newS;
        }
      } else {
        updatedSalaries.unshift(newS);
      }
    });
    return { salaries: updatedSalaries };
  }),
  fetchSalaries: async (force = false, isAdmin = false) => {
    const { isStale, salaries, isFetching, isAdminCache } = get();
    if (isFetching) return;
    
    // Optimized Logic: Admin needs Admin cache. Personal works with either Personal OR Admin cache.
    const isScopeAdequate = isAdmin ? isAdminCache : true;
    
    if (!force && salaries.length > 0 && !isStale && isScopeAdequate) {
      console.log(`SalaryStore: Using verified ${isAdminCache ? 'Admin' : 'Personal'} cache (Zero GET)`);
      return;
    }

    set({ isFetching: true });
    try {
      const response = isAdmin ? await api.salary.getAllSalaries() : await api.salary.getAll();
      if (response.ok) {
        const data = await response.json();
        set({ salaries: data, lastFetched: Date.now(), isStale: false, isAdminCache: isAdmin });
      }
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
    } finally {
      set({ isFetching: false });
    }
  },
  clearCache: () => set({ salaries: [], lastFetched: null, isStale: true, isAdminCache: false })
}));
