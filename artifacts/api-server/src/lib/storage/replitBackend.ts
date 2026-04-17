// ============================================================================
// Replit object-storage backend
// ----------------------------------------------------------------------------
// Wrapt de bestaande ObjectStorageService (lib/objectStorage.ts) achter de
// gemeenschappelijke StorageBackend interface. Werkt alleen binnen Replit
// (heeft de Replit sidecar op poort 1106 nodig).
// ============================================================================

import { Readable } from "stream";
import type { Response as ExpressResponse } from "express";
import {
  ObjectStorageService,
  ObjectNotFoundError as LegacyNotFound,
} from "../objectStorage";
import {
  ObjectNotFoundError,
  type StorageBackend,
  type CreateUploadOptions,
  type UploadTarget,
} from "./types";

export class ReplitStorageBackend implements StorageBackend {
  readonly name = "replit" as const;
  private service = new ObjectStorageService();

  async createUpload(_opts: CreateUploadOptions): Promise<UploadTarget> {
    const uploadURL = await this.service.getObjectEntityUploadURL();
    const objectPath = this.service.normalizeObjectEntityPath(uploadURL);
    return { uploadURL, objectPath };
  }

  async serveObject(objectPath: string, res: ExpressResponse): Promise<void> {
    let file;
    try {
      file = await this.service.getObjectEntityFile(objectPath);
    } catch (err) {
      if (err instanceof LegacyNotFound) throw new ObjectNotFoundError();
      throw err;
    }

    const response = await this.service.downloadObject(file);
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");

    if (response.body) {
      const reader = response.body.getReader();
      const nodeReadable = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) this.push(null);
          else this.push(Buffer.from(value));
        },
      });
      nodeReadable.pipe(res);
    } else {
      res.status(204).end();
    }
  }
}
