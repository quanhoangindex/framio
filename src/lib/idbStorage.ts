import { StateStorage } from "zustand/middleware";

// IndexedDB-backed storage for zustand persist.
// localStorage caps out around 5MB — a couple of photo strips exceed it.
// IndexedDB comfortably holds hundreds of MB.
const DB_NAME = "framio";
const STORE = "keyval";

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    };
  });
}

const isBrowser = () =>
  typeof window !== "undefined" && typeof indexedDB !== "undefined";

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    if (!isBrowser()) return null;
    const value = await withStore<string | undefined>("readonly", (s) =>
      s.get(name)
    );
    if (value !== undefined && value !== null) return value;

    // One-time migration of previously persisted localStorage state
    try {
      const legacy = localStorage.getItem(name);
      if (legacy) {
        await withStore("readwrite", (s) => s.put(legacy, name));
        localStorage.removeItem(name);
        return legacy;
      }
    } catch {
      // localStorage unavailable/corrupt — start fresh
    }
    return null;
  },
  setItem: async (name, value) => {
    if (!isBrowser()) return;
    await withStore("readwrite", (s) => s.put(value, name));
  },
  removeItem: async (name) => {
    if (!isBrowser()) return;
    await withStore("readwrite", (s) => s.delete(name));
  },
};
