// ============================================================================
// Storage backend abstraction
// ----------------------------------------------------------------------------
// Eén interface die door zowel de Replit object-storage backend als de lokale
// schijf-backend wordt geïmplementeerd. Routes en frontend praten alleen tegen
// deze interface — om te switchen tussen Replit en self-hosted hoef je alleen
// de env var STORAGE_BACKEND te veranderen (zie ./index.ts).
// ============================================================================

import type { Response as ExpressResponse } from "express";

export interface UploadTarget {
  /** URL waar de client een PUT naartoe doet met het bestand in de body. */
  uploadURL: string;
  /** Canonieke pad dat in de DB wordt opgeslagen (altijd `/objects/<id>`). */
  objectPath: string;
}

export interface CreateUploadOptions {
  contentType: string;
  /** API base URL (bv. https://tarapokes.nl) — alleen relevant voor lokale backend. */
  apiBaseUrl?: string;
}

export interface StorageBackend {
  readonly name: "replit" | "local";

  /** Maak een upload-target aan; client doet daarna PUT naar uploadURL. */
  createUpload(opts: CreateUploadOptions): Promise<UploadTarget>;

  /** Stream een eerder geüpload object terug naar de HTTP-response. */
  serveObject(objectPath: string, res: ExpressResponse): Promise<void>;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}
