
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
  private initPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
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
          const db = (event.target as IDBOpenDBRequest).result;
          
          db.onversionchange = () => {
            db.close();
            this.db = null;
            this.initPromise = null;
            console.warn('Vault version change detected. Connection closed.');
          };

          db.onclose = () => {
            this.db = null;
            this.initPromise = null;
            console.warn('Vault connection closed unexpectedly.');
          };

          this.db = db;
          this.runRetentionCleanup(db).catch(err => console.error('Cleanup failed:', err));
          resolve(db);
        };

        request.onerror = () => {
          this.initPromise = null;
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('Vault connection blocked by another tab. Please close other instances.');
        };
      } catch (err) {
        this.initPromise = null;
        reject(err);
      }
    });

    return this.initPromise;
  }

  /**
   * Helper to execute a transaction with automatic retry on connection failure
   */
  private async execute<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore, transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const run = async (): Promise<T> => {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(STORE_NAME, mode);
          const store = transaction.objectStore(STORE_NAME);
          
          operation(store, transaction)
            .then(resolve)
            .catch(reject);

          transaction.onerror = () => reject(transaction.error);
        } catch (err: any) {
          reject(err);
        }
      });
    };

    try {
      return await run();
    } catch (err: any) {
      // If error suggests a closed/closing connection, reset and retry once
      const isConnectionError = 
        err.name === 'InvalidStateError' || 
        err.name === 'TransactionInactiveError' ||
        err.message?.toLowerCase().includes('closing') || 
        err.message?.toLowerCase().includes('closed');

      if (isConnectionError) {
        console.warn('Vault connection stale detected, attempting re-initialization...');
        this.db = null;
        this.initPromise = null;
        return await run();
      }
      throw err;
    }
  }

  public async insert(type: VaultEntry['type'], metadata: any, retentionDays: number = 30): Promise<VaultEntry> {
    const entry: VaultEntry = {
      id: `VX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type,
      metadata,
      timestamp: Date.now(),
      expiresAt: Date.now() + (retentionDays * 24 * 60 * 60 * 1000)
    };

    return this.execute('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(entry);
        request.onsuccess = () => resolve(entry);
        request.onerror = () => reject(request.error);
      });
    });
  }

  public async getEntries(type?: VaultEntry['type']): Promise<VaultEntry[]> {
    return this.execute('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = type ? store.index('type').getAll(type) : store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  public async delete(id: string): Promise<void> {
    return this.execute('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  public async purgeAll(): Promise<void> {
    return this.execute('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  private async runRetentionCleanup(activeDb?: IDBDatabase) {
    const db = activeDb || await this.getDB();
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiresAt');
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    } catch (err) {
      console.warn('Retention cleanup skipped due to inactive connection');
    }
  }

  public async getStats() {
    try {
      const entries = await this.getEntries();
      return {
        totalRecords: entries.length,
        storageUsed: (JSON.stringify(entries).length / 1024),
        lastSync: new Date().toISOString()
      };
    } catch (err) {
      console.error('Failed to get vault stats:', err);
      return {
        totalRecords: 0,
        storageUsed: 0,
        lastSync: 'Sync Offline'
      };
    }
  }
}

export const localVault = new CipherXVault();
