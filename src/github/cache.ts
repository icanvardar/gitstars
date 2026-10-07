const DB_NAME = 'gitstars'
const STORE = 'repos'
const TTL_MS = 60 * 60 * 1000

type Entry<T> = { value: T; savedAt: number }

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) return resolve(null)
        try {
          const request = fn(db.transaction(STORE, mode).objectStore(STORE))
          request.onsuccess = () => resolve((request.result as T) ?? null)
          request.onerror = () => resolve(null)
        } catch {
          resolve(null)
        }
      }),
  )
}

export async function readCache<T>(key: string): Promise<T | null> {
  const entry = await run<Entry<T>>('readonly', (store) => store.get(key))
  if (!entry || Date.now() - entry.savedAt > TTL_MS) return null
  return entry.value
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  const entry: Entry<T> = { value, savedAt: Date.now() }
  await run('readwrite', (store) => store.put(entry, key))
}
