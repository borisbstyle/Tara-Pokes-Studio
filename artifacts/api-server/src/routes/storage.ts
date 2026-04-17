// ============================================================================
// Storage routes — leunen op de StorageBackend abstractie in lib/storage.
// Werken identiek voor zowel de Replit- als de lokale-schijf-backend.
// Switch via env var STORAGE_BACKEND (zie lib/storage/index.ts en SELF_HOSTING.md).
// ============================================================================

import { Router, type IRouter, type Request, type Response } from "express";
import {
  getStorage,
  LocalStorageBackend,
  ObjectNotFoundError,
} from "../lib/storage";

const router: IRouter = Router();

/** Bouw een API base URL op basis van het inkomende verzoek (fallback voor lokale backend). */
function deriveApiBase(req: Request): string {
  if (process.env.PUBLIC_API_BASE_URL) return process.env.PUBLIC_API_BASE_URL;
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "localhost";
  return `${proto}://${host}`;
}

/**
 * POST /storage/uploads/request-url
 * Body: { name, size, contentType }
 * Returns: { uploadURL, objectPath }
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, contentType } = req.body ?? {};
  if (!name || !contentType) {
    res.status(400).json({ error: "name and contentType are required" });
    return;
  }

  try {
    const target = await getStorage().createUpload({
      contentType,
      apiBaseUrl: deriveApiBase(req),
    });
    res.json(target);
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * PUT /storage/local-upload/:id
 * Ontvangt het ruwe bestand voor de LocalStorageBackend. Geeft 404 als de
 * actieve backend niet de lokale is (bv. op Replit zelf).
 */
router.put("/storage/local-upload/:id", async (req: Request, res: Response) => {
  const storage = getStorage();
  if (!(storage instanceof LocalStorageBackend)) {
    res.status(404).json({ error: "Local upload disabled (STORAGE_BACKEND != local)" });
    return;
  }
  try {
    await storage.acceptUpload(req.params.id, req);
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(400).json({ error: "Invalid upload id" });
    } else {
      console.error("Local upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
});

/**
 * GET /storage/objects/serve?path=/objects/<id>
 * Streamt een eerder geüpload object terug. Werkt voor beide backends.
 */
router.get("/storage/objects/serve", async (req: Request, res: Response) => {
  const objectPath = req.query.path as string;
  if (!objectPath || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "Invalid object path" });
    return;
  }
  try {
    await getStorage().serveObject(objectPath, res);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
    } else {
      console.error("Error serving object:", err);
      res.status(500).json({ error: "Failed to serve object" });
    }
  }
});

export default router;
