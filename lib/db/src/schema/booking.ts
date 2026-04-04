import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const availableSlots = pgTable("available_slots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAvailableSlotSchema = createInsertSchema(availableSlots).omit({
  id: true,
  createdAt: true,
});
export type AvailableSlot = typeof availableSlots.$inferSelect;
export type InsertAvailableSlot = z.infer<typeof insertAvailableSlotSchema>;

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull().references(() => availableSlots.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: text("status").default("pending").notNull(),
  photoUrls: text("photo_urls").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export const bookingSettings = pgTable("booking_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").default(false).notNull(),
  adminNote: text("admin_note"),
});

export type BookingSettings = typeof bookingSettings.$inferSelect;
