import { create } from 'zustand';
import { api } from './api';

export interface AttendanceRecord {
  _id: string;
  date: string;
  inTime: string;
  outTime?: string;
  status: string;
  lateMinutes: number;
  user?: any;
  office?: any;
  sessions?: any[];
}

export interface LivePresence {
  _id: string;
  name: string;
  photo?: string;
  office: string;
  userType: string;
  isClockedIn: boolean;
  lastIn: string | null;
  status: string;
  updatedAt?: string;
}

export interface OfficeStats {
  office: string;
  totalEmployees: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  presentPercentage: string;
}

interface AttendanceState {
  myAttendance: AttendanceRecord[];
  livePresence: LivePresence[];
  dailyStats: OfficeStats[];
  adminSelectedUserAttendance: AttendanceRecord[];
  selectedUserId: string | null;
  isStale: { // Per-Page Suspect Flags
    myAttendance: boolean;
    livePresence: boolean;
    dailyStats: boolean;
    adminSelectedUserAttendance: boolean;
  };
  lastFetched: {
    myAttendance: string | null; // "YYYY-MM"
    livePresence: number | null;
    dailyStats: number | null;
    adminSelectedUserAttendance: string | null; // "userId-YYYY-MM"
    currentMonthAttendanceCount: number | null; // null means never fetched
  };
  lastDailyStatsFilters: string; // Serialized filters to detect changes
  isFetching: { [key: string]: boolean };
  currentMonthAttendanceCount: number;
  
  // Actions
  setStale: (key: keyof AttendanceState['isStale'], stale: boolean) => void;
  fetchMyAttendance: (force?: boolean) => Promise<void>;
  fetchLivePresence: (force?: boolean) => Promise<void>;
  fetchDailyStats: (force?: boolean, filters?: any) => Promise<void>;
  fetchUserMonthlyAttendance: (userId: string, month: number, year: number, force?: boolean) => Promise<void>;
  fetchMonthlyCount: (force?: boolean) => Promise<void>;
  setCurrentMonthAttendanceCount: (count: number) => void;
  incrementAttendanceCount: () => void;
  
  // Sync Actions for Socket
  addOrUpdateMyAttendance: (record: AttendanceRecord) => void;
  updateLivePresenceNode: (node: LivePresence) => void;
  updateAdminViewedAttendance: (record: AttendanceRecord) => void;
  setDailyStats: (stats: OfficeStats[]) => void;
  updateUserInAttendance: (userId: string, name: string, photo?: string) => void;
  updateOfficeInAttendance: (officeId: string, officeName: string) => void;
  clearStore: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  myAttendance: [],
  livePresence: [],
  dailyStats: [],
  adminSelectedUserAttendance: [],
  selectedUserId: null,
  lastDailyStatsFilters: '',
  isFetching: {},
  currentMonthAttendanceCount: 0,
  isStale: {
    myAttendance: false,
    livePresence: false,
    dailyStats: false,
    adminSelectedUserAttendance: false,
  },
  lastFetched: {
    myAttendance: null,
    livePresence: null,
    dailyStats: null,
    adminSelectedUserAttendance: null,
    currentMonthAttendanceCount: null,
  },

  setCurrentMonthAttendanceCount: (count) => set({ currentMonthAttendanceCount: count }),
  incrementAttendanceCount: () => set(state => ({ currentMonthAttendanceCount: state.currentMonthAttendanceCount + 1 })),

  setStale: (key, stale) => set((state) => ({ 
    isStale: { ...state.isStale, [key]: stale } 
  })),

  fetchMyAttendance: async (force = false) => {
    const now = new Date();
    const currentMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Bulletproof Logic: Skip if verified cache exists
    if (!force && get().myAttendance.length > 0 && !get().isStale.myAttendance && get().lastFetched.myAttendance === currentMonthLabel) {
      console.log('AttendanceStore: Using verified MyAttendance cache (Zero GET)');
      return;
    }

    if (get().isFetching.myAttendance) return;
    set(state => ({ isFetching: { ...state.isFetching, myAttendance: true } }));

    try {
      // Fetch only current month data specifically
      const response = await api.attendance.getMine({ 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      });
      
      if (response.ok) {
        const data = await response.json();
        set({ 
          myAttendance: data,
          isStale: { ...get().isStale, myAttendance: false },
          lastFetched: { ...get().lastFetched, myAttendance: currentMonthLabel }
        });
      }
    } catch (err) { console.error(err); }
    finally {
      set(state => ({ isFetching: { ...state.isFetching, myAttendance: false } }));
    }
  },

  fetchLivePresence: async (force = false) => {
    if (get().isFetching.livePresence) return;

    // Bulletproof Logic: Skip if verified cache exists
    if (!force && get().livePresence.length > 0 && !get().isStale.livePresence) {
      console.log('AttendanceStore: Using verified LivePresence cache (Zero GET)');
      return;
    }

    set({ isFetching: { ...get().isFetching, livePresence: true } });
    try {
      const response = await api.attendance.getLivePresence();
      if (response.ok) {
        const data = await response.json();
        set({
          livePresence: data,
          isStale: { ...get().isStale, livePresence: false },
          lastFetched: { ...get().lastFetched, livePresence: Date.now() }
        });
      }
    } catch (err) { console.error(err); }
    finally {
      set({ isFetching: { ...get().isFetching, livePresence: false } });
    }
  },

  fetchDailyStats: async (force = false, filters: any = {}) => {
    const filterKey = JSON.stringify(filters);
    const { livePresence, lastDailyStatsFilters, isFetching, isStale, dailyStats, lastFetched } = get();

    if (isFetching.dailyStats) return;

    // --- HEURISTIC: Local Cache Check --- 
    // If we have livePresence data, we can derive the stats locally instead of hitting the backend
    if (!force && livePresence.length > 0 && !isStale.livePresence) {
      console.log('AttendanceStore: Deriving DailyStats from LivePresence local cache (Zero GET)');
      
      const offices = filters.office ? [filters.office] : Array.from(new Set(livePresence.map(p => p.office)));
      
      const derivedStats: OfficeStats[] = offices.map(officeId => {
        const officeNodes = livePresence.filter(p => 
          p.office === officeId && 
          (!filters.userType || p.userType === filters.userType)
        );
        
        const total = officeNodes.length;
        const present = officeNodes.filter(p => p.isClockedIn).length;
        const late = officeNodes.filter(p => p.status === 'Late' && p.isClockedIn).length;
        const halfDay = officeNodes.filter(p => p.status === 'Half-Day' && p.isClockedIn).length;
        const absent = total - present;
        
        return {
          office: officeId,
          totalEmployees: total,
          present,
          late,
          halfDay,
          absent,
          presentPercentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0.0'
        };
      });

      set({ 
        dailyStats: derivedStats, 
        lastDailyStatsFilters: filterKey,
        isStale: { ...isStale, dailyStats: false },
        lastFetched: { ...lastFetched, dailyStats: Date.now() } 
      });
      return;
    }

    // --- FALLBACK: Backend Fetch ---
    const last = lastFetched.dailyStats;
    const isSameFilter = lastDailyStatsFilters === filterKey;
    if (!force && isSameFilter && dailyStats.length > 0 && !isStale.dailyStats && last && (Date.now() - last < 300000)) {
      return;
    }

    set({ isFetching: { ...get().isFetching, dailyStats: true } });
    try {
      const response = await api.attendance.getStats({ ...filters, date: new Date().toISOString().split('T')[0] });
      if (response.ok) {
        const data = await response.json();
        set({ 
          dailyStats: data, 
          lastDailyStatsFilters: filterKey,
          isStale: { ...get().isStale, dailyStats: false },
          lastFetched: { ...get().lastFetched, dailyStats: Date.now() } 
        });
      }
    } catch (err) { console.error(err); }
    finally {
      set({ isFetching: { ...get().isFetching, dailyStats: false } });
    }
  },

  fetchUserMonthlyAttendance: async (userId, month, year, force = false) => {
    const label = `${userId}-${year}-${month}`;

    // Bulletproof Logic
    if (!force && get().adminSelectedUserAttendance.length > 0 && !get().isStale.adminSelectedUserAttendance && get().lastFetched.adminSelectedUserAttendance === label) {
      console.log('AttendanceStore: Using verified AdminAttendance cache (Zero GET)');
      return;
    }

    if (get().isFetching.adminSelectedUserAttendance) return;
    set(state => ({ isFetching: { ...state.isFetching, adminSelectedUserAttendance: true } }));


    try {
      const response = await api.attendance.getMonthly({ userId, month, year });
      if (response.ok) {
        const data = await response.json();
        set({
          adminSelectedUserAttendance: data,
          selectedUserId: userId,
          isStale: { ...get().isStale, adminSelectedUserAttendance: false },
          lastFetched: { ...get().lastFetched, adminSelectedUserAttendance: label }
        });
      }
    } catch (err) { console.error(err); }
    finally {
      set(state => ({ isFetching: { ...state.isFetching, adminSelectedUserAttendance: false } }));
    }
  },

  fetchMonthlyCount: async (force = false) => {
    const now = new Date();
    const currentMonthLabel = now.getMonth() + 1;
    const currentYearLabel = now.getFullYear();
    const { lastFetched, isFetching } = get();

    if (!force && lastFetched.currentMonthAttendanceCount !== null) {
      console.log('AttendanceStore: Using cached monthly count');
      return;
    }

    if (isFetching.currentMonthAttendanceCount) return;
    set(state => ({ isFetching: { ...state.isFetching, currentMonthAttendanceCount: true } }));

    try {
      const response = await api.attendance.getMonthlyCount({ 
        month: currentMonthLabel.toString(), 
        year: currentYearLabel.toString() 
      });
      if (response.ok) {
        const data = await response.json();
        set({ 
          currentMonthAttendanceCount: data.count,
          lastFetched: { ...lastFetched, currentMonthAttendanceCount: Date.now() }
        });
      }
    } catch (err) { console.error(err); }
    finally {
      set(state => ({ isFetching: { ...state.isFetching, currentMonthAttendanceCount: false } }));
    }
  },

  addOrUpdateMyAttendance: (record) => {
    const { myAttendance } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const recDate = new Date(record.date);
    if (recDate < startOfMonth) return;

    const newList = [...myAttendance];
    const index = newList.findIndex(a => a.date.split('T')[0] === record.date.split('T')[0]);
    if (index > -1) newList[index] = { ...newList[index], ...record };
    else newList.unshift(record);
    set({ myAttendance: newList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
  },

  updateLivePresenceNode: (node) => {
    const { livePresence } = get();
    const newList = [...livePresence];
    const index = newList.findIndex(p => p._id === node._id);
    if (index > -1) {
      const oldNode = newList[index];
      newList[index] = { ...oldNode, ...node };
      set({ livePresence: newList });
      if (oldNode.status !== node.status || oldNode.isClockedIn !== node.isClockedIn) {
        get().fetchDailyStats(true);
      }
    }
  },

  updateAdminViewedAttendance: (record) => {
    const { adminSelectedUserAttendance, selectedUserId } = get();
    // Assuming record.user is the ID
    const recordUserId = typeof record.user === 'object' ? record.user._id : record.user;
    if (selectedUserId !== recordUserId) return;

    const newList = [...adminSelectedUserAttendance];
    const index = newList.findIndex(a => a.date.split('T')[0] === record.date.split('T')[0]);
    if (index > -1) newList[index] = { ...newList[index], ...record };
    else newList.unshift(record);
    set({ adminSelectedUserAttendance: newList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
  },

  setDailyStats: (stats) => set({ 
    dailyStats: stats, 
    lastFetched: { ...get().lastFetched, dailyStats: Date.now() } 
  }),
  updateUserInAttendance: (userId, name, photo) => set((state) => ({
    livePresence: state.livePresence.map(p => 
      p._id === userId ? { ...p, name, photo: photo || p.photo } : p
    ),
    myAttendance: state.myAttendance.map(a => 
      (a.user && (a.user._id === userId || (a.user as any) === userId))
        ? { ...a, user: { ...a.user, name, photo: photo || a.user.photo } }
        : a
    ),
    adminSelectedUserAttendance: state.adminSelectedUserAttendance.map(a => 
      (a.user && (a.user._id === userId || (a.user as any) === userId))
        ? { ...a, user: { ...a.user, name, photo: photo || a.user.photo } }
        : a
    )
  })),
  updateOfficeInAttendance: (officeId, officeName) => set((state) => ({
    myAttendance: state.myAttendance.map(a => 
      (a.office && (a.office._id === officeId || (a.office as any) === officeId))
        ? { ...a, office: { ...a.office, name: officeName } }
        : a
    ),
    livePresence: state.livePresence.map(p => 
      (p.office === officeId) ? { ...p, officeName } : p // Handle both ID and Potential Label
    )
  })),

  clearStore: () => set({
    myAttendance: [],
    livePresence: [],
    dailyStats: [],
    adminSelectedUserAttendance: [],
    selectedUserId: null,
    lastFetched: { 
      myAttendance: null, 
      livePresence: null, 
      dailyStats: null, 
      adminSelectedUserAttendance: null,
      currentMonthAttendanceCount: null
    }
  })
}));
