import { Router } from "express";
import { db } from "@workspace/db";
import {
  availableSlots,
  bookings,
  bookingSettings,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "./admin.middleware";

const router = Router();

// ── helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateSettings() {
  const [row] = await db.select().from(bookingSettings).limit(1);
  if (row) return row;
  const [created] = await db.insert(bookingSettings).values({ enabled: false }).returning();
  return created;
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────

/** GET /api/booking/status  →  { enabled, slots } */
router.get("/status", async (_req, res) => {
  const settings = await getOrCreateSettings();
  if (!settings.enabled) {
    res.json({ enabled: false, slots: [] });
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const slots = await db
    .select()
    .from(availableSlots)
    .where(and(eq(availableSlots.isActive, true)));

  // Only return slots that are not already booked and in the future
  const bookedSlotIds = new Set(
    (await db.select({ slotId: bookings.slotId }).from(bookings)
      .where(eq(bookings.status, "confirmed"))).map((b) => b.slotId)
  );

  const freeSlots = slots.filter(
    (s) => !bookedSlotIds.has(s.id) && s.date >= today
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  res.json({ enabled: true, slots: freeSlots });
});

/** POST /api/booking/book  →  creates a pending booking */
router.post("/book", async (req, res) => {
  const settings = await getOrCreateSettings();
  if (!settings.enabled) {
    res.status(403).json({ error: "Booking is not currently available." });
    return;
  }

  const { slotId, name, email, phone, message } = req.body;
  if (!slotId || !name || !email) {
    res.status(400).json({ error: "slotId, name and email are required." });
    return;
  }

  const [slot] = await db.select().from(availableSlots).where(eq(availableSlots.id, Number(slotId)));
  if (!slot || !slot.isActive) {
    res.status(404).json({ error: "Slot not found or inactive." });
    return;
  }

  const [existing] = await db.select().from(bookings)
    .where(and(eq(bookings.slotId, Number(slotId)), eq(bookings.status, "confirmed")));
  if (existing) {
    res.status(409).json({ error: "This slot is already booked." });
    return;
  }

  const [booking] = await db.insert(bookings).values({
    slotId: Number(slotId),
    name,
    email,
    phone: phone ?? null,
    message: message ?? null,
  }).returning();

  res.json({ success: true, booking });
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

/** GET /api/booking/admin/settings */
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

/** PATCH /api/booking/admin/settings */
router.patch("/admin/settings", requireAdmin, async (req, res) => {
  const settings = await getOrCreateSettings();
  const { enabled, adminNote } = req.body;
  const [updated] = await db.update(bookingSettings)
    .set({
      ...(typeof enabled === "boolean" ? { enabled } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    })
    .where(eq(bookingSettings.id, settings.id))
    .returning();
  res.json(updated);
});

/** GET /api/booking/admin/slots  – all slots with booking status */
router.get("/admin/slots", requireAdmin, async (_req, res) => {
  const slots = await db.select().from(availableSlots)
    .orderBy(availableSlots.date, availableSlots.startTime);

  const allBookings = await db.select().from(bookings);
  const bookingsBySlot = new Map<number, typeof allBookings>();
  for (const b of allBookings) {
    if (!bookingsBySlot.has(b.slotId)) bookingsBySlot.set(b.slotId, []);
    bookingsBySlot.get(b.slotId)!.push(b);
  }

  res.json(slots.map((s) => ({ ...s, bookings: bookingsBySlot.get(s.id) ?? [] })));
});

/** POST /api/booking/admin/slots  – create a slot */
router.post("/admin/slots", requireAdmin, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  if (!date || !startTime || !endTime) {
    res.status(400).json({ error: "date, startTime and endTime are required." });
    return;
  }
  const [slot] = await db.insert(availableSlots).values({ date, startTime, endTime }).returning();
  res.json(slot);
});

/** PATCH /api/booking/admin/slots/:id  – toggle isActive */
router.patch("/admin/slots/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body;
  const [slot] = await db.update(availableSlots)
    .set({ isActive })
    .where(eq(availableSlots.id, id))
    .returning();
  res.json(slot);
});

/** DELETE /api/booking/admin/slots/:id */
router.delete("/admin/slots/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(bookings).where(eq(bookings.slotId, id));
  await db.delete(availableSlots).where(eq(availableSlots.id, id));
  res.json({ success: true });
});

/** GET /api/booking/admin/bookings */
router.get("/admin/bookings", requireAdmin, async (_req, res) => {
  const all = await db.select({
    booking: bookings,
    slot: availableSlots,
  }).from(bookings)
    .leftJoin(availableSlots, eq(bookings.slotId, availableSlots.id))
    .orderBy(bookings.createdAt);
  res.json(all);
});

/** PATCH /api/booking/admin/bookings/:id */
router.patch("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const [booking] = await db.update(bookings)
    .set({ status })
    .where(eq(bookings.id, id))
    .returning();
  res.json(booking);
});

export default router;
