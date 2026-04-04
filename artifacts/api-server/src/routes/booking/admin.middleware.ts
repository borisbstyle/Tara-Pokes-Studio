import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const pin = process.env.ADMIN_PIN ?? "tarapokes";
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== pin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
