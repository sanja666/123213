const DB_NAME = 'epakalpojumi_demo';
const DB_VERSION = 1;
const STORES = ['payments', 'cases', 'serviceOrders', 'gameResults', 'documents', 'notices'];

let dbPromise;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = callback(store);
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAll(store) {
  return withStore(store, 'readonly', (objectStore) => objectStore.getAll());
}

export async function idbPut(store, value) {
  return withStore(store, 'readwrite', (objectStore) => objectStore.put(value));
}

export async function idbDelete(store, key) {
  return withStore(store, 'readwrite', (objectStore) => objectStore.delete(key));
}

export async function idbBulkPut(store, values) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    values.forEach((value) => objectStore.put(value));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbClear(store) {
  return withStore(store, 'readwrite', (objectStore) => objectStore.clear());
}

export async function resetDb() {
  const db = await openDb();
  db.close();
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    deleteRequest.onsuccess = () => {
      dbPromise = undefined;
      resolve(true);
    };
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
}

export function loadLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('loadLocal error', error);
    return fallback;
  }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('saveLocal error', error);
  }
}

export function removeLocal(key) {
  localStorage.removeItem(key);
}

export function now() {
  return new Date().toISOString();
}

export function generateId(prefix) {
  return `${prefix}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10)}`;
}

