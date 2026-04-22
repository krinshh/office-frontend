import { create } from 'zustand';
import { api } from './api';

interface Office {
  _id: string;
  name: string;
  address: string;
  isActive?: boolean;
  updatedAt?: string;
}

interface UserType {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
  isDeletable?: boolean;
  createdAt: string;
  updatedAt: string; // Used for Timestamp Guard
}

interface SimpleUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  photo?: string;
  office?: any;
  userType?: any;
  isActive?: boolean;
  joiningDate?: string;
  ctc?: number;
  baseSalary?: number;
  ta?: number;
  vpf?: number;
  gratuity?: number;
  deactivatedAt?: string;
  updatedAt?: string; // Used for Timestamp Guard
}

interface AppState {
  offices: Office[];
  userTypes: UserType[];
  users: SimpleUser[];
  isStale: Record<string, boolean>; // Per-Page Suspect Flags
  lastFetched: Record<string, number | null>;
  isFetching: Record<string, boolean>; // Request Locking
  
  setStale: (key: string, stale: boolean) => void;
  setOffices: (offices: Office[]) => void;
  setUserTypes: (userTypes: UserType[]) => void;
  setUsers: (users: SimpleUser[]) => void;
  
  fetchOffices: (force?: boolean) => Promise<void>;
  fetchUserTypes: (force?: boolean) => Promise<void>;
  fetchUsers: (force?: boolean, params?: any) => Promise<void>;
  
  addOrUpdateOffice: (office: Office) => void;
  addOrUpdateUserType: (userType: UserType) => void;
  addOrUpdateUser: (user: SimpleUser) => void;
  
  removeOffice: (id: string) => void;
  removeUserType: (id: string) => void;
  removeUser: (id: string) => void;
  
  fetchAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  offices: [],
  userTypes: [],
  users: [],
  isStale: {
    offices: false,
    userTypes: false,
    users: false
  },
  lastFetched: {
    offices: null,
    userTypes: null,
    users: null
  },
  isFetching: {
    offices: false,
    userTypes: false,
    users: false
  },

  setStale: (key, stale) => set((state) => ({ 
    isStale: { ...state.isStale, [key]: stale } 
  })),

  setOffices: (offices) => set((state) => ({ 
    offices, 
    isStale: { ...state.isStale, offices: false },
    lastFetched: { ...state.lastFetched, offices: Date.now() },
    isFetching: { ...get().isFetching, offices: false }
  })),
  
  setUserTypes: (userTypes) => set((state) => ({ 
    userTypes, 
    isStale: { ...state.isStale, userTypes: false },
    lastFetched: { ...state.lastFetched, userTypes: Date.now() },
    isFetching: { ...get().isFetching, userTypes: false }
  })),
  
  setUsers: (users) => set((state) => ({ 
    users, 
    isStale: { ...state.isStale, users: false },
    lastFetched: { ...state.lastFetched, users: Date.now() },
    isFetching: { ...get().isFetching, users: false }
  })),
  
  removeOffice: (id) => set((state) => ({ 
    offices: state.offices.filter(o => o._id !== id) 
  })),
  
  removeUserType: (id) => set((state) => ({ 
    userTypes: state.userTypes.filter(ut => ut._id !== id) 
  })),
  
  removeUser: (id) => set((state) => ({ 
    users: state.users.filter(u => u._id !== id) 
  })),

  fetchOffices: async (force = false) => {
    // Bulletproof Logic: Skip if verified cache exists
    if (!force && get().offices.length > 0 && !get().isStale.offices) {
      console.log('AppStore: Using verified Offices cache (Zero GET)');
      return;
    }

    if (get().isFetching.offices) return; // Lock: Request already in flight

    set(state => ({ isFetching: { ...state.isFetching, offices: true } }));
    try {
      const response = await api.offices.getAll();
      if (response.ok) {
        const data = await response.json();
        get().setOffices(data);
      }
    } catch (error) {
      console.error('Failed to fetch offices:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, offices: false } }));
    }
  },

  fetchUserTypes: async (force = false) => {
    // Bulletproof Logic: Skip if verified cache exists
    if (!force && get().userTypes.length > 0 && !get().isStale.userTypes) {
      console.log('AppStore: Using verified UserTypes cache (Zero GET)');
      return;
    }

    if (get().isFetching.userTypes) return; // Lock: Request already in flight

    set(state => ({ isFetching: { ...state.isFetching, userTypes: true } }));
    try {
      const response = await api.users.getTypes();
      if (response.ok) {
        const data = await response.json();
        get().setUserTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch user types:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, userTypes: false } }));
    }
  },

  fetchUsers: async (force = false, params?: any) => {
    // Bulletproof Logic: TRUST the cache if not stale and we have data
    if (!force && get().users.length > 0 && !get().isStale.users) {
      console.log('AppStore: Using verified Users cache (Zero GET)');
      return;
    }

    if (get().isFetching.users) return; // Universal Lock for users resource

    set(state => ({ isFetching: { ...state.isFetching, users: true } }));
    try {
      const response = await api.users.getAll(params);
      if (response.ok) {
        const data = await response.json();
        get().setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, users: false } }));
    }
  },

  addOrUpdateOffice: (office) => set((state) => {
    if (office.isActive === false) {
      return { offices: state.offices.filter(o => o._id !== office._id) };
    }
    const exists = state.offices.find(o => o._id === office._id);
    
    // Timestamp Guard
    if (exists && office.updatedAt && exists.updatedAt && new Date(office.updatedAt) <= new Date(exists.updatedAt)) {
      return state;
    }

    // Safety sync: Update populated office references in users array
    let updatedUsers = state.users;
    if (exists && exists.name !== office.name) {
      updatedUsers = state.users.map(u => 
        (u.office && (u.office._id === office._id || u.office === office._id)) 
          ? { ...u, office: { ...u.office, name: office.name } } 
          : u
      );
    }

    if (exists) {
      return { 
        offices: state.offices.map(o => o._id === office._id ? { ...o, ...office } : o),
        users: updatedUsers 
      };
    }
    return { offices: [office, ...state.offices] };
  }),

  addOrUpdateUserType: (userType) => set((state) => {
    if (userType.isActive === false) {
      return { userTypes: state.userTypes.filter(ut => ut._id !== userType._id) };
    }
    const exists = state.userTypes.find(ut => ut._id === userType._id);
    
    // Timestamp Guard
    if (exists && userType.updatedAt && exists.updatedAt && new Date(userType.updatedAt) <= new Date(exists.updatedAt)) {
      return state;
    }

    // Safety sync: Update populated userType references in users array
    let updatedUsers = state.users;
    if (exists && exists.name !== userType.name) {
      updatedUsers = state.users.map(u => 
        (u.userType && (u.userType._id === userType._id || u.userType === userType._id)) 
          ? { ...u, userType: { ...u.userType, name: userType.name } } 
          : u
      );
    }

    if (exists) {
      return { 
        userTypes: state.userTypes.map(ut => ut._id === userType._id ? { ...ut, ...userType } : ut),
        users: updatedUsers
      };
    }
    return { userTypes: [userType, ...state.userTypes] };
  }),

  addOrUpdateUser: (user) => set((state) => {
    if (user.isActive === false) {
      return { users: state.users.filter(u => u._id !== user._id) };
    }
    const exists = state.users.find(u => u._id === user._id);
    
    // Timestamp Guard
    if (exists && user.updatedAt && exists.updatedAt && new Date(user.updatedAt) <= new Date(exists.updatedAt)) {
      return state;
    }

    if (exists) {
      return { users: state.users.map(u => u._id === user._id ? { ...u, ...user } : u) };
    }
    return { users: [user, ...state.users] };
  }),

  fetchAll: async () => {
    await Promise.all([
      get().fetchOffices(false),
      get().fetchUserTypes(false),
      get().fetchUsers(false)
    ]);
  }
}));
