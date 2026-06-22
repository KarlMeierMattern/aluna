import { openDB, type IDBPDatabase } from "idb";
import { DEFAULT_STATE, type AlunaState } from "./types";

const DB_NAME = "aluna-db";
const STORE = "state";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

function storageKey(userId: string): string {
  return `user:${userId}`;
}

export async function loadState(userId: string): Promise<AlunaState> {
  try {
    const db = await getDb();
    const stored = await db.get(STORE, storageKey(userId));
    if (!stored) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...(stored as Partial<AlunaState>) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(userId: string, state: AlunaState): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, state, storageKey(userId));
  } catch (e) {
    console.warn("IndexedDB save failed", e);
  }
}

export async function exportState(userId: string): Promise<string> {
  const state = await loadState(userId);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
}

export async function importState(
  userId: string,
  json: string
): Promise<AlunaState> {
  const parsed = JSON.parse(json) as { state?: AlunaState };
  if (!parsed.state) throw new Error("Invalid export file");
  const state = { ...DEFAULT_STATE, ...parsed.state };
  await saveState(userId, state);
  return state;
}
