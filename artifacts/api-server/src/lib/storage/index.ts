// ============================================================================
// Storage factory — kiest backend op basis van env var STORAGE_BACKEND
// ----------------------------------------------------------------------------
//   STORAGE_BACKEND=replit   (default)  — Replit object storage (huidig gedrag)
//   STORAGE_BACKEND=local               — Lokale schijf (zie SELF_HOSTING.md)
//
// De lokale backend gebruikt ook:
//   LOCAL_STORAGE_DIR=/home/pi/tara-pokes/uploads   (default: ./uploads)
//   PUBLIC_API_BASE_URL=https://tarapokes.nl        (voor upload-URL constructie)
// ============================================================================

import { LocalStorageBackend } from "./localBackend";
import { ReplitStorageBackend } from "./replitBackend";
import type { StorageBackend } from "./types";

let cached: StorageBackend | null = null;

export function getStorage(): StorageBackend {
  if (cached) return cached;

  const choice = (process.env.STORAGE_BACKEND ?? "replit").toLowerCase();
  if (choice === "local") {
    cached = new LocalStorageBackend();
  } else {
    cached = new ReplitStorageBackend();
  }
  return cached;
}

export { LocalStorageBackend } from "./localBackend";
export { ReplitStorageBackend } from "./replitBackend";
export { ObjectNotFoundError } from "./types";
export type { StorageBackend, UploadTarget, CreateUploadOptions } from "./types";
