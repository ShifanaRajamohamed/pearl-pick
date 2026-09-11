// Offline Synchronization Engine for PEARL PICK!
// Manages local caching, queued mutations, background sync, and offline simulation

export interface OfflineSyncItem {
  id: string;
  type: 'DESIGN_SAVED' | 'QUOTE_REQUESTED' | 'MEASUREMENTS_UPDATED' | 'CHAT_SENT' | 'ORDER_UPDATED';
  label: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

const STORAGE_KEY_QUEUE = 'pearl_pick_offline_queue_v1';
const STORAGE_KEY_CACHE = 'pearl_pick_offline_cache_v1';
const STORAGE_KEY_SIMULATE = 'pearl_pick_simulate_offline_v1';

type SyncListener = (state: {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  queue: OfflineSyncItem[];
  isSyncing: boolean;
  lastSyncedAt: string | null;
}) => void;

class OfflineSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncedAt: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedSim = localStorage.getItem(STORAGE_KEY_SIMULATE);
        if (storedSim === 'true') {
          this.isSimulatedOffline = true;
        }
      } catch {
        // ignore storage errors
      }

      window.addEventListener('online', () => {
        this.isOnlineStatus = true;
        this.notify();
        if (!this.isSimulatedOffline) {
          this.autoSync();
        }
      });

      window.addEventListener('offline', () => {
        this.isOnlineStatus = false;
        this.notify();
      });
    }
  }

  public get effectiveOnline(): boolean {
    return this.isOnlineStatus && !this.isSimulatedOffline;
  }

  public get isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public get simulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public setSimulatedOffline(simulated: boolean) {
    this.isSimulatedOffline = simulated;
    try {
      localStorage.setItem(STORAGE_KEY_SIMULATE, simulated ? 'true' : 'false');
    } catch {
      // storage safety
    }
    this.notify();
    if (!simulated && this.isOnlineStatus) {
      this.autoSync();
    }
  }

  public getQueue(): OfflineSyncItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: OfflineSyncItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
    } catch {
      // ignore
    }
    this.notify();
  }

  public enqueue(type: OfflineSyncItem['type'], label: string, payload: any): OfflineSyncItem {
    const item: OfflineSyncItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      payload,
      status: 'pending'
    };

    const currentQueue = this.getQueue();
    currentQueue.push(item);
    this.saveQueue(currentQueue);

    // If we are actually online, auto-sync immediately in background
    if (this.effectiveOnline) {
      setTimeout(() => this.autoSync(), 400);
    }

    return item;
  }

  public clearQueue() {
    this.saveQueue([]);
  }

  public async autoSync(): Promise<{ success: boolean; count: number }> {
    if (this.isSyncing) return { success: false, count: 0 };
    const queue = this.getQueue();
    if (queue.length === 0) return { success: true, count: 0 };

    this.isSyncing = true;
    this.notify();

    // Mark all as syncing
    const syncingQueue = queue.map(item => ({ ...item, status: 'syncing' as const }));
    this.saveQueue(syncingQueue);

    return new Promise((resolve) => {
      setTimeout(() => {
        const count = syncingQueue.length;
        this.saveQueue([]); // clear queued items on successful sync
        this.isSyncing = false;
        this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notify();
        resolve({ success: true, count });
      }, 1200);
    });
  }

  // Cache snapshots for full offline availability
  public saveSnapshot(key: string, data: any) {
    try {
      const all = this.getCachedSnapshots();
      all[key] = {
        data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(all));
    } catch {
      // ignore
    }
  }

  public getCachedSnapshots(): Record<string, { data: any; updatedAt: string }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CACHE);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnlineStatus,
      isSimulatedOffline: this.isSimulatedOffline,
      effectiveOnline: this.effectiveOnline,
      queue: this.getQueue(),
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt
    });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = {
      isOnline: this.isOnlineStatus,
      isSimulatedOffline: this.isSimulatedOffline,
      effectiveOnline: this.effectiveOnline,
      queue: this.getQueue(),
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt
    };
    this.listeners.forEach(l => l(state));
  }
}

export const offlineSyncManager = new OfflineSyncManager();
