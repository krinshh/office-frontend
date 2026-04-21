import { create } from 'zustand';

interface Task {
  _id: string;
  name: string;
  description: string;
  office?: { _id: string; name: string };
  userCategory: { _id: string; name: string };
  frequency: string;
  type: string;
  priority: string;
  createdBy: { _id: string; name: string; email: string; photo?: string };
  createdAt: string;
  updatedAt: string; // Used for Timestamp Guard
  recurringUntil?: string;
}

interface Assignment {
  _id: string;
  task: Task;
  assignedTo: { _id: string; name: string; email: string; photo?: string; office?: any; userType?: any }[];
  assignedBy: { _id: string; name: string; email: string; photo?: string };
  status: string;
  dueDate?: string;
  completedAt?: string;
  updatedAt: string; // Used for Timestamp Guard
  remarks?: string;
}

interface TaskState {
  tasks: Task[];
  assignments: Assignment[];
  isStale: boolean; // Flag for Selective Re-Sync
  isFetching: {
    tasks: boolean;
    assignments: boolean;
  };
  lastFetched: {
    tasks: number | null;
    assignments: number | null;
    currentMonthStats: number | null; // null means never fetched
  };
  setStale: (stale: boolean) => void;
  setTasks: (tasks: Task[]) => void;
  setAssignments: (assignments: Assignment[]) => void;
  addOrUpdateTask: (task: Task) => void;
  addOrUpdateAssignment: (assignment: Assignment) => void;
  removeAssignment: (assignmentId: string) => void;
  clearCache: () => void;
  currentMonthStats: {
    active: number;
    completed: number;
  };
  setMonthStats: (stats: { active: number; completed: number }) => void;
  incrementStats: (type: 'active' | 'completed') => void;
  decrementStats: (type: 'active' | 'completed') => void;
  fetchTasks: (force?: boolean) => Promise<void>;
  fetchAssignments: (force?: boolean) => Promise<void>;
  fetchMonthlyStats: (force?: boolean) => Promise<void>;
}

import { api } from './api';

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  assignments: [],
  isStale: false,
  isFetching: {
    tasks: false,
    assignments: false
  },
  lastFetched: {
    tasks: null,
    assignments: null,
    currentMonthStats: null
  },
  currentMonthStats: {
    active: 0,
    completed: 0
  },
  setStale: (isStale) => set({ isStale }),
  setMonthStats: (stats) => set({ currentMonthStats: stats }),
  incrementStats: (type) => set(state => ({ 
    currentMonthStats: { 
      ...state.currentMonthStats, 
      [type]: state.currentMonthStats[type] + 1 
    } 
  })),
  decrementStats: (type) => set(state => ({ 
    currentMonthStats: { 
      ...state.currentMonthStats, 
      [type]: Math.max(0, state.currentMonthStats[type] - 1) 
    } 
  })),
  setTasks: (tasks) => set({ 
    tasks, 
    lastFetched: { ...get().lastFetched, tasks: Date.now() }, 
    isStale: false,
    isFetching: { ...get().isFetching, tasks: false }
  }),
  setAssignments: (assignments) => set({ 
    assignments, 
    lastFetched: { ...get().lastFetched, assignments: Date.now() }, 
    isStale: false,
    isFetching: { ...get().isFetching, assignments: false }
  }),
  addOrUpdateTask: (task) => set((state) => {
    const existing = state.tasks.find(t => t._id === task._id);
    if (existing) {
      if (new Date(task.updatedAt) <= new Date(existing.updatedAt)) return state;
      return { tasks: state.tasks.map(t => t._id === task._id ? task : t) };
    }
    return { tasks: [task, ...state.tasks] };
  }),
  addOrUpdateAssignment: (assignment) => set((state) => {
    const existing = state.assignments.find(a => a._id === assignment._id);
    if (existing) {
      if (new Date(assignment.updatedAt) <= new Date(existing.updatedAt)) return state;
      return { assignments: state.assignments.map(a => a._id === assignment._id ? assignment : a) };
    }
    return { assignments: [assignment, ...state.assignments] };
  }),
  removeAssignment: (assignmentId) => set((state) => ({
    assignments: state.assignments.filter(a => a._id !== assignmentId)
  })),
  clearCache: () => set({ 
    tasks: [], 
    assignments: [], 
    lastFetched: { 
      tasks: null, 
      assignments: null,
      currentMonthStats: null 
    }, 
    isStale: true,
    isFetching: { tasks: false, assignments: false }
  }),
  fetchTasks: async (force = false) => {
    // Bulletproof Logic: TRUST the cache if not stale and we have data (or have checked once)
    if (!force && get().lastFetched.tasks !== null && !get().isStale) {
      console.log('TaskStore: Using verified cache (Zero GET)');
      return;
    }
    
    if (get().isFetching.tasks) return; // Dedicated Lock

    set(state => ({ isFetching: { ...state.isFetching, tasks: true } }));
    try {
      const response = await api.tasks.getAll();
      if (response.ok) {
        const data = await response.json();
        set({ 
          tasks: data, 
          lastFetched: { ...get().lastFetched, tasks: Date.now() }, 
          isStale: false 
        });
      }
    } catch (error) {
      console.error('Failed to fetch tasks in store:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, tasks: false } }));
    }
  },
  fetchAssignments: async (force = false) => {
    // Bulletproof Logic: TRUST the cache if not stale and we have data (or have checked once)
    if (!force && get().lastFetched.assignments !== null && !get().isStale) {
      console.log('AssignmentStore: Using verified cache (Zero GET)');
      return;
    }

    if (get().isFetching.assignments) return; // Dedicated Lock

    set(state => ({ isFetching: { ...state.isFetching, assignments: true } }));
    try {
      const response = await api.tasks.getAssignments();
      if (response.ok) {
        const data = await response.json();
        set({ 
          assignments: data, 
          lastFetched: { ...get().lastFetched, assignments: Date.now() }, 
          isStale: false 
        });
      }
    } catch (error) {
      console.error('Failed to fetch assignments in store:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, assignments: false } }));
    }
  },
  fetchMonthlyStats: async (force = false) => {
    const now = new Date();
    const { lastFetched, isFetching } = get();

    if (!force && lastFetched.currentMonthStats !== null) {
      console.log('TaskStore: Using cached monthly stats');
      return;
    }

    // Reuse assignments fetching lock if needed or add new one
    set(state => ({ isFetching: { ...state.isFetching, assignments: true } }));
    try {
      const response = await api.tasks.getAssignmentStats({ 
        month: (now.getMonth() + 1).toString(), 
        year: now.getFullYear().toString() 
      });
      if (response.ok) {
        const data = await response.json();
        set({ 
          currentMonthStats: {
            active: data.totalActive,
            completed: data.totalCompleted
          },
          lastFetched: { ...lastFetched, currentMonthStats: Date.now() }
        });
      }
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
    } finally {
      set(state => ({ isFetching: { ...state.isFetching, assignments: false } }));
    }
  }
}));
