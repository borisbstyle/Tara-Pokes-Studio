// ============================================================================
// ⚠️  SELF-HOSTING TODO — foto-upload endpoints
// ----------------------------------------------------------------------------
// Deze routes leunen volledig op ../lib/objectStorage.ts (Replit object-storage).
// Voor self-hosting op een Pi/VPS hoef je deze file niet te herschrijven —
// pas alleen objectStorage.ts aan zodat:
//   - POST /storage/uploads/request-url → een eigen lokale upload-URL teruggeeft
//   - GET  /storage/objects/serve       → vanaf disk (of MinIO/S3) leest
//
// Eventueel wil je hieronder een extra route toevoegen voor de daadwerkelijke
// PUT-upload als je Optie A (lokale schijf) gebruikt — bijvoorbeeld:
//   router.put("/storage/upload/:id", express.raw({ limit: "20mb" }), …)
// die het bestand naar /home/pi/tara-pokes/uploads/<id> schrijft.
// ============================================================================

import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 * Body: { name, size, contentType }
 * Returns: { uploadURL, objectPath }
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body ?? {};
  if (!name || !contentType) {
    res.status(400).json({ error: "name and contentType are required" });
    return;
  }

  try {
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * GET /storage/objects/serve?path=...
 * Serve private object entities via query param.
 */
router.get("/storage/objects/serve", async (req: Request, res: Response) => {
  const objectPath = req.query.path as string;
  if (!objectPath || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "Invalid object path" });
    return;
  }
  try {
    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(file);
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
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
    } else {
      res.status(500).json({ error: "Failed to serve object" });
    }
  }
});

export default router;
