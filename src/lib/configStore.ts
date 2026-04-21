import { create } from 'zustand';
import { api } from './api';

interface HRASlab {
  _id: string;
  office: any;
  userType: any;
  minSalary: number;
  maxSalary: number;
  hraPercentage: number;
}

interface ConfigState {
  config: any | null;
  hraSlabs: HRASlab[];
  isStale: {
    config: boolean;
    hraSlabs: boolean;
  };
  lastFetched: {
    config: number | null;
    hraSlabs: number | null;
  };
  isFetching: {
    config: boolean;
    hraSlabs: boolean;
  };
  
  setStale: (key: keyof ConfigState['isStale'], stale: boolean) => void;
  setConfig: (config: any) => void;
  setHRASlabs: (slabs: HRASlab[]) => void;
  
  fetchConfig: (force?: boolean) => Promise<void>;
  fetchHRASlabs: (force?: boolean) => Promise<void>;
  
  addOrUpdateHRASlab: (slab: HRASlab) => void;
  removeHRASlab: (id: string) => void;
  
  fetchAll: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  hraSlabs: [],
  isStale: {
    config: false,
    hraSlabs: false
  },
  lastFetched: {
    config: null,
    hraSlabs: null
  },
  isFetching: {
    config: false,
    hraSlabs: false
  },

  setStale: (key, stale) => set((state) => ({ 
    isStale: { ...state.isStale, [key]: stale } 
  })),

  setConfig: (config) => set((state) => ({ 
    config, 
    isStale: { ...state.isStale, config: false },
    lastFetched: { ...state.lastFetched, config: Date.now() },
    isFetching: { ...get().isFetching, config: false }
  })),
  
  setHRASlabs: (hraSlabs) => set((state) => ({ 
    hraSlabs, 
    isStale: { ...state.isStale, hraSlabs: false },
    lastFetched: { ...state.lastFetched, hraSlabs: Date.now() },
    isFetching: { ...get().isFetching, hraSlabs: false }
  })),

  fetchConfig: async (force = false) => {
    const { isStale, config, isFetching } = get();
    if (isFetching.config) return; // Single-Flight Lock

    // Bulletproof Logic: Skip if verified cache exists
    if (!force && config && !isStale.config) {
      console.log('ConfigStore: Using verified Config cache (Zero GET)');
      return;
    }

    set((state) => ({ isFetching: { ...state.isFetching, config: true } }));
    try {
      const response = await api.globalConfig.get();
      if (response.ok) {
        const data = await response.json();
        get().setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      set((state) => ({ isFetching: { ...state.isFetching, config: false } }));
    }
  },

  fetchHRASlabs: async (force = false) => {
    const { isStale, hraSlabs, isFetching } = get();
    if (isFetching.hraSlabs) return; // Single-Flight Lock
    
    // Bulletproof Logic: Skip if verified cache exists
    if (!force && hraSlabs.length > 0 && !isStale.hraSlabs) {
      console.log('ConfigStore: Using verified HRASlabs cache (Zero GET)');
      return;
    }

    set((state) => ({ isFetching: { ...state.isFetching, hraSlabs: true } }));
    try {
      const response = await api.globalConfig.getHRASlabs();
      if (response.ok) {
        const data = await response.json();
        get().setHRASlabs(data);
      }
    } catch (error) {
      console.error('Failed to fetch HRA slabs:', error);
    } finally {
      set((state) => ({ isFetching: { ...state.isFetching, hraSlabs: false } }));
    }
  },

  addOrUpdateHRASlab: (slab) => set((state) => {
    const exists = state.hraSlabs.find(s => s._id === slab._id);
    if (exists) {
      return { hraSlabs: state.hraSlabs.map(s => s._id === slab._id ? slab : s) };
    }
    return { hraSlabs: [...state.hraSlabs, slab].sort((a, b) => a.minSalary - b.minSalary) };
  }),

  removeHRASlab: (id) => set((state) => ({
    hraSlabs: state.hraSlabs.filter(s => s._id !== id)
  })),

  fetchAll: async () => {
    await Promise.all([get().fetchConfig(false), get().fetchHRASlabs(false)]);
  }
}));
