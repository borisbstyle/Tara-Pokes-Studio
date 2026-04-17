// ============================================================================
// Lokale schijf storage backend
// ----------------------------------------------------------------------------
// Bewaart geüploade bestanden op de lokale schijf in LOCAL_STORAGE_DIR (default
// `./uploads`). Bedoeld voor self-hosting (Raspberry Pi / VPS) — geen externe
// dependencies, geen credentials nodig.
//
// Bestandsstructuur per upload:
//   <DIR>/<uuid>          → de ruwe bytes
//   <DIR>/<uuid>.json     → klein metadata-bestand: { contentType }
//
// Path conventie: in de DB staat altijd `/objects/<uuid>` — identiek aan wat
// de Replit-backend opslaat. Dat betekent dat foto's die met de Replit-backend
// zijn opgeslagen NIET vanzelf overgaan; je migreert die los (zie SELF_HOSTING.md).
//
// Veiligheid: <uuid> moet matchen op een UUID-regex. Géén slashes, dotdot
// segments of andere padmanipulatie toegestaan.
// ============================================================================

import { createReadStream, createWriteStream } from "fs";
import { mkdir, stat, writeFile, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import type { Request, Response as ExpressResponse } from "express";
import {
  ObjectNotFoundError,
  type StorageBackend,
  type CreateUploadOptions,
  type UploadTarget,
} from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function defaultDir(): string {
  // Default: <api-server>/uploads — overschrijfbaar via LOCAL_STORAGE_DIR
  return process.env.LOCAL_STORAGE_DIR
    ? path.resolve(process.env.LOCAL_STORAGE_DIR)
    : path.resolve(process.cwd(), "uploads");
}

export class LocalStorageBackend implements StorageBackend {
  readonly name = "local" as const;
  readonly dir: string;

  constructor(dir: string = defaultDir()) {
    this.dir = dir;
  }

  async ensureDir(): Promise<void> {
    await mkdir(this.dir, { recursive: true });
  }

  /** Bouwt het volledige absolute pad voor een gegeven id. Throws bij invalide id. */
  filePath(id: string, suffix: "" | ".json" = ""): string {
    if (!UUID_RE.test(id)) throw new ObjectNotFoundError();
    return path.join(this.dir, `${id}${suffix}`);
  }

  async createUpload(opts: CreateUploadOptions): Promise<UploadTarget> {
    await this.ensureDir();
    const id = randomUUID();
    const objectPath = `/objects/${id}`;

    // Sla alvast een metadata-stub op zodat we het content-type later weten.
    // De PUT route bevestigt dit nogmaals — handig als de client een ander
    // type stuurt dan eerst aangevraagd.
    await writeFile(
      this.filePath(id, ".json"),
      JSON.stringify({ contentType: opts.contentType, pending: true }),
    );

    const base = (opts.apiBaseUrl ?? process.env.PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
    const uploadURL = `${base}/api/storage/local-upload/${id}`;
    return { uploadURL, objectPath };
  }

  /** Wordt aangeroepen door de PUT route in routes/storage.ts */
  async acceptUpload(id: string, req: Request): Promise<void> {
    if (!UUID_RE.test(id)) throw new ObjectNotFoundError();
    await this.ensureDir();

    const target = this.filePath(id);
    await pipeline(req, createWriteStream(target));

    const contentType = req.headers["content-type"] || "application/octet-stream";
    await writeFile(this.filePath(id, ".json"), JSON.stringify({ contentType }));
  }

  async serveObject(objectPath: string, res: ExpressResponse): Promise<void> {
    if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
    const id = objectPath.slice("/objects/".length);

    const file = this.filePath(id);

    let size: number;
    try {
      const st = await stat(file);
      if (!st.isFile()) throw new ObjectNotFoundError();
      size = st.size;
    } catch {
      throw new ObjectNotFoundError();
    }

    let contentType = "application/octet-stream";
    try {
      const meta = JSON.parse(await readFile(this.filePath(id, ".json"), "utf8"));
      if (typeof meta.contentType === "string") contentType = meta.contentType;
    } catch {
      // metadata ontbreekt → val terug op octet-stream
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(size));
    res.setHeader("Cache-Control", "private, max-age=3600");
    createReadStream(file).pipe(res);
  }
}
