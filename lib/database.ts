
/**
 * CipherX Local Vault - Advanced On-Device Encrypted Database
 * Powered by IndexedDB for PWA scale storage.
 */

const DB_NAME = 'CipherXVault';
const STORE_NAME = 'secure_metadata';
const DB_VERSION = 1;

export interface VaultEntry {
  id: string;
  type: 'INTRUSION' | 'THREAT' | 'PASSWORD_META' | 'APP_INTEGRITY';
  metadata: any;
  timestamp: number;
  expiresAt: number;
}

class CipherXVault {
  private db: IDBDatabase | null = null;

  constructor() {
    this.init();
  }

  private init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.runRetentionCleanup();
        resolve(this.db);
      };

      request.onerror = (err) => reject(err);
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.init();
  }

  public async insert(type: VaultEntry['type'], metadata: any, retentionDays: number = 30): Promise<VaultEntry> {
    const db = await this.getDB();
    const entry: VaultEntry = {
      id: `VX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type,
      metadata,
      timestamp: Date.now(),
      expiresAt: Date.now() + (retentionDays * 24 * 60 * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);
      request.onsuccess = () => resolve(entry);
      request.onerror = () => reject(request.error);
    });
  }

  public async getEntries(type?: VaultEntry['type']): Promise<VaultEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = type ? store.index('type').getAll(type) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async delete(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async purgeAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async runRetentionCleanup() {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('expiresAt');
    const now = Date.now();
    
    // Using a cursor to delete expired entries
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  }

  public async getStats() {
    const entries = await this.getEntries();
    return {
      totalRecords: entries.length,
      storageUsed: (JSON.stringify(entries).length / 1024), // Approx KB
      lastSync: new Date().toISOString()
    };
  }
}

export const localVault = new CipherXVault();
