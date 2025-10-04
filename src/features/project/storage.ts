"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "vibeviz-projects";
const DB_VERSION = 1;
const STORE_ASSETS = "assets";

type AssetType = "audio" | "glb";

type AssetRecord = {
  key: string;
  projectId: string;
  type: AssetType;
  filename: string;
  mimeType?: string;
  blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_ASSETS)) {
          const store = database.createObjectStore(STORE_ASSETS, { keyPath: "key" });
          store.createIndex("projectId", "projectId");
        }
      },
    });
  }
  return dbPromise;
}

function createAssetKey(projectId: string, type: AssetType): string {
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${projectId}:${type}:${uniqueId}`;
}

export async function storeProjectAsset(
  projectId: string,
  type: AssetType,
  filename: string,
  blob: Blob,
): Promise<{ assetKey: string; filename: string; mimeType?: string }> {
  const db = await getDB();
  const key = createAssetKey(projectId, type);
  const record: AssetRecord = {
    key,
    projectId,
    type,
    filename,
    mimeType: blob.type || undefined,
    blob,
  };
  await db.put(STORE_ASSETS, record);
  return { assetKey: key, filename, mimeType: record.mimeType };
}

export async function getProjectAsset(assetKey: string): Promise<AssetRecord | null> {
  const db = await getDB();
  const record = await db.get(STORE_ASSETS, assetKey);
  return (record as AssetRecord | undefined) ?? null;
}

export async function deleteProjectAssets(projectId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_ASSETS, "readwrite");
  const index = tx.store.index("projectId");

  for await (const cursor of index.iterate(projectId)) {
    cursor.delete();
  }

  await tx.done;
}