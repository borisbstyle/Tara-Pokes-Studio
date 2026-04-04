import { Router } from "express";
import { db } from "@workspace/db";
import {
  availableSlots,
  bookings,
  bookingSettings,
} from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { requireAdmin } from "./admin.middleware";
import { Resend } from "resend";

const router = Router();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "taravanderaa@gmail.com";

async function getOrCreateSettings() {
  const [row] = await db.select().from(bookingSettings).limit(1);
  if (row) return row;
  const [created] = await db.insert(bookingSettings).values({ enabled: false }).returning();
  return created;
}

function formatDateNL(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

async function sendBookingNotification(booking: {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  photoUrls?: string[] | null;
}, slot: { date: string; startTime: string; endTime: string }) {
  if (!resend) return;

  const domain = (process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim();
  const baseUrl = domain ? `https://${domain}` : "";
  const photoSection = booking.photoUrls?.length
    ? `<p><strong>Foto's:</strong><br>${booking.photoUrls.map((u, i) =>
        baseUrl
          ? `<a href="${baseUrl}/api/storage/objects/serve?path=${encodeURIComponent(u)}">Foto ${i + 1}</a>`
          : `Foto ${i + 1}: ${u}`
      ).join("<br>")}</p>`
    : "";

  try {
    await resend.emails.send({
      from: "Tara Pokes <noreply@tarapokes.com>",
      to: ADMIN_EMAIL,
      subject: `Nieuwe afspraak aanvraag van ${booking.name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; color: #333; padding: 32px;">
          <h2 style="font-weight: normal; font-size: 24px; margin-bottom: 24px;">Nieuwe afspraak aanvraag</h2>
          <p><strong>Naam:</strong> ${booking.name}</p>
          <p><strong>E-mail:</strong> ${booking.email}</p>
          ${booking.phone ? `<p><strong>Telefoon:</strong> ${booking.phone}</p>` : ""}
          <p><strong>Tijdslot:</strong> ${formatDateNL(slot.date)} · ${slot.startTime} – ${slot.endTime}</p>
          ${booking.message ? `<p><strong>Bericht:</strong><br>${booking.message}</p>` : ""}
          ${photoSection}
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="color: #999; font-size: 13px;">Beheer afspraken via /admin op je website.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send booking email:", err);
  }
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────

router.get("/status", async (_req, res) => {
  const settings = await getOrCreateSettings();
  if (!settings.enabled) {
    res.json({ enabled: false, slots: [] });
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const slots = await db.select().from(availableSlots).where(eq(availableSlots.isActive, true));

  const bookedSlotIds = new Set(
    (await db.select({ slotId: bookings.slotId }).from(bookings)
      .where(eq(bookings.status, "confirmed"))).map((b) => b.slotId)
  );

  const freeSlots = slots.filter(
    (s) => !bookedSlotIds.has(s.id) && s.date >= today
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  res.json({ enabled: true, slots: freeSlots });
});

router.post("/book", async (req, res) => {
  const settings = await getOrCreateSettings();
  if (!settings.enabled) {
    res.status(403).json({ error: "Booking is not currently available." });
    return;
  }

  const { slotId, name, email, phone, message, photoUrls } = req.body;
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
    photoUrls: Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : null,
  }).returning();

  // Send notification email to Tara (non-blocking)
  sendBookingNotification({ name, email, phone, message, photoUrls }, slot);

  res.json({ success: true, booking });
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

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

router.post("/admin/slots", requireAdmin, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  if (!date || !startTime || !endTime) {
    res.status(400).json({ error: "date, startTime and endTime are required." });
    return;
  }
  const [slot] = await db.insert(availableSlots).values({ date, startTime, endTime }).returning();
  res.json(slot);
});

router.patch("/admin/slots/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { isActive, date, startTime, endTime } = req.body;
  const [slot] = await db.update(availableSlots)
    .set({
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
    })
    .where(eq(availableSlots.id, id))
    .returning();
  res.json(slot);
});

router.delete("/admin/slots/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(bookings).where(eq(bookings.slotId, id));
  await db.delete(availableSlots).where(eq(availableSlots.id, id));
  res.json({ success: true });
});

router.get("/admin/bookings", requireAdmin, async (_req, res) => {
  const all = await db.select({
    booking: bookings,
    slot: availableSlots,
  }).from(bookings)
    .leftJoin(availableSlots, eq(bookings.slotId, availableSlots.id))
    .orderBy(bookings.createdAt);
  res.json(all);
});

/** PATCH /api/booking/admin/bookings/:id — update status */
router.patch("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const [booking] = await db.update(bookings)
    .set({ status })
    .where(eq(bookings.id, id))
    .returning();
  res.json(booking);
});

/** PATCH /api/booking/admin/bookings/:id/slot — reassign to a different slot */
router.patch("/admin/bookings/:id/slot", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { slotId } = req.body;
  if (!slotId) {
    res.status(400).json({ error: "slotId is required." });
    return;
  }

  const newSlotId = Number(slotId);

  // Make sure the new slot exists, is active, and is not already confirmed-booked by someone else
  const [slot] = await db.select().from(availableSlots).where(eq(availableSlots.id, newSlotId));
  if (!slot || !slot.isActive) {
    res.status(404).json({ error: "Slot not found or inactive." });
    return;
  }

  const [conflict] = await db.select().from(bookings)
    .where(and(
      eq(bookings.slotId, newSlotId),
      eq(bookings.status, "confirmed"),
      ne(bookings.id, id),
    ));
  if (conflict) {
    res.status(409).json({ error: "That slot is already booked by someone else." });
    return;
  }

  const [updated] = await db.update(bookings)
    .set({ slotId: newSlotId })
    .where(eq(bookings.id, id))
    .returning();
  res.json(updated);
});

export default router;
