import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'oms-offline-db';
const STORE_NAME = 'attendance-queue';

export interface OfflineAttendance {
    id?: number;
    type: 'in' | 'out';
    timestamp: string;
    latitude: number;
    longitude: number;
    office?: string;
    userId: string;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
    if (typeof window === 'undefined') return null;
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }
    return dbPromise;
};

export const offlineStore = {
    async addAttendance(data: OfflineAttendance) {
        const db = await getDB();
        if (!db) return;
        return db.add(STORE_NAME, data);
    },

    async getAllPending() {
        const db = await getDB();
        if (!db) return [];
        return db.getAll(STORE_NAME);
    },

    async clearPending(ids: number[]) {
        const db = await getDB();
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all(ids.map(id => tx.store.delete(id)));
        await tx.done;
    }
};
