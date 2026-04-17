import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Clock, Calendar, User, Mail as MailIcon, Image, RefreshCw, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import logoImg from "@/assets/logo.png";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function authHeaders(pin: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${pin}` };
}

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  bookings: Booking[];
}

interface Booking {
  id: number;
  slotId: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  photoUrls: string[] | null;
  createdAt: string;
}

interface BookingWithSlot {
  booking: Booking;
  slot: Slot | null;
}

type Tab = "instellingen" | "slots" | "afspraken" | "agenda";

function statusColor(s: string) {
  if (s === "confirmed") return "text-green-700 bg-green-50 border-green-200";
  if (s === "cancelled") return "text-red-600 bg-red-50 border-red-200";
  return "text-amber-700 bg-amber-50 border-amber-200";
}
function statusLabel(s: string) {
  if (s === "confirmed") return "Bevestigd";
  if (s === "cancelled") return "Geannuleerd";
  return "In afwachting";
}

/** Build a wa.me URL with a prefilled Dutch confirmation message. */
function whatsappConfirmUrl(
  booking: { name: string; phone: string | null },
  slot: { date: string; startTime: string; endTime: string } | null,
): string | null {
  if (!booking.phone) return null;
  const digits = booking.phone.replace(/\D/g, "");
  const intl = digits.startsWith("00")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? "31" + digits.slice(1)
      : digits.startsWith("31")
        ? digits
        : digits;
  const firstName = booking.name.split(" ")[0] || booking.name;
  const dateStr = slot
    ? new Date(slot.date + "T00:00:00").toLocaleDateString("nl-NL", {
        weekday: "long", day: "numeric", month: "long",
      })
    : "";
  const timeStr = slot ? `${slot.startTime} – ${slot.endTime}` : "";
  const lines = [
    `Hi ${firstName}!`,
    "",
    "Wat leuk dat je een afspraak hebt geboekt bij Tara Pokes 🌿",
    "Je afspraak is bevestigd:",
    "",
    slot ? `📅 ${dateStr}` : "",
    slot ? `⏰ ${timeStr}` : "",
    "📍 Uden, Nederland",
    "",
    "Het exacte adres en eventuele voorbereidingstips stuur ik je binnenkort.",
    "Laat het me weten als je nog vragen hebt!",
    "",
    "Tot snel,",
    "Tara",
  ].filter(Boolean);
  return `https://wa.me/${intl}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);

  const [tab, setTab] = useState<Tab>("instellingen");
  const [enabled, setEnabled] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("11:00");
  const [addingSlot, setAddingSlot] = useState(false);

  const [bookingsList, setBookingsList] = useState<BookingWithSlot[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reassigning, setReassigning] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [daySlotStart, setDaySlotStart] = useState("10:00");
  const [daySlotEnd, setDaySlotEnd] = useState("11:00");
  const [addingDaySlot, setAddingDaySlot] = useState(false);

  async function verifyPin() {
    setCheckingPin(true);
    setPinError(false);
    try {
      const res = await fetch(`${BASE}/api/booking/admin/settings`, {
        headers: { Authorization: `Bearer ${pinInput}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPin(pinInput);
        setEnabled(data.enabled);
        setAdminNote(data.adminNote ?? "");
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    } finally {
      setCheckingPin(false);
    }
  }

  async function loadSlots() {
    setSlotsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/booking/admin/slots`, { headers: { Authorization: `Bearer ${pin}` } });
      if (res.ok) setSlots(await res.json());
    } finally {
      setSlotsLoading(false);
    }
  }

  async function loadBookings() {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/booking/admin/bookings`, { headers: { Authorization: `Bearer ${pin}` } });
      if (res.ok) setBookingsList(await res.json());
    } finally {
      setBookingsLoading(false);
    }
  }

  function startReassign(booking: BookingWithSlot) {
    setReassigning(booking.booking.id);
    setEditDate(booking.slot?.date ?? "");
    setEditStart(booking.slot?.startTime ?? "");
    setEditEnd(booking.slot?.endTime ?? "");
  }

  async function saveSlotEdit(slotId: number) {
    if (!editDate || !editStart || !editEnd) return;
    await fetch(`${BASE}/api/booking/admin/slots/${slotId}`, {
      method: "PATCH",
      headers: authHeaders(pin),
      body: JSON.stringify({ date: editDate, startTime: editStart, endTime: editEnd }),
    });
    setReassigning(null);
    await loadBookings();
  }

  useEffect(() => {
    if (!pin) return;
    if (tab === "slots") loadSlots();
    if (tab === "afspraken") loadBookings();
    if (tab === "agenda") loadSlots();
  }, [tab, pin]);

  async function toggleFeature() {
    setSettingsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/booking/admin/settings`, {
        method: "PATCH",
        headers: authHeaders(pin),
        body: JSON.stringify({ enabled: !enabled, adminNote }),
      });
      if (res.ok) { const d = await res.json(); setEnabled(d.enabled); }
    } finally {
      setSettingsLoading(false);
    }
  }

  async function saveNote() {
    setSettingsLoading(true);
    try {
      await fetch(`${BASE}/api/booking/admin/settings`, {
        method: "PATCH",
        headers: authHeaders(pin),
        body: JSON.stringify({ adminNote }),
      });
    } finally {
      setSettingsLoading(false);
    }
  }

  async function addSlot() {
    if (!newDate || !newStart || !newEnd) return;
    setAddingSlot(true);
    try {
      const res = await fetch(`${BASE}/api/booking/admin/slots`, {
        method: "POST",
        headers: authHeaders(pin),
        body: JSON.stringify({ date: newDate, startTime: newStart, endTime: newEnd }),
      });
      if (res.ok) { setNewDate(""); await loadSlots(); }
    } finally {
      setAddingSlot(false);
    }
  }

  async function toggleSlot(id: number, current: boolean) {
    await fetch(`${BASE}/api/booking/admin/slots/${id}`, {
      method: "PATCH", headers: authHeaders(pin), body: JSON.stringify({ isActive: !current }),
    });
    await loadSlots();
  }

  async function deleteSlot(id: number) {
    if (!confirm("Dit slot en alle bijbehorende afspraken verwijderen?")) return;
    await fetch(`${BASE}/api/booking/admin/slots/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${pin}` } });
    await loadSlots();
  }

  async function updateBookingStatus(id: number, status: string) {
    await fetch(`${BASE}/api/booking/admin/bookings/${id}`, {
      method: "PATCH", headers: authHeaders(pin), body: JSON.stringify({ status }),
    });
    await Promise.all([loadBookings(), loadSlots()]);
  }

  async function confirmViaEmail(id: number) {
    try {
      const res = await fetch(`${BASE}/api/booking/admin/bookings/${id}/confirm-email`, {
        method: "POST", headers: authHeaders(pin),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 && data.error === "not_configured") {
        alert(`${data.title}\n\n${data.message}`);
        return;
      }
      if (!res.ok) {
        alert(`Bevestigingsmail kon niet verstuurd worden:\n\n${data.message ?? data.error ?? "Onbekende fout"}`);
        return;
      }
      alert("Bevestigingsmail verstuurd ✓");
      await Promise.all([loadBookings(), loadSlots()]);
    } catch (err) {
      alert(`Er ging iets mis: ${err}`);
    }
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!pin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <img src={logoImg} alt="Tara Pokes" className="h-20 w-20 object-contain mb-8 opacity-80" />
        <h1 className="font-serif text-2xl text-foreground/80 mb-2 italic">Admin</h1>
        <p className="text-sm text-foreground/45 mb-8 font-light">Voer je PIN in om door te gaan</p>
        <div className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifyPin()}
            placeholder="PIN"
            data-testid="input-admin-pin"
            className="w-full px-4 py-3 border border-border/60 bg-white text-sm text-center tracking-widest focus:outline-none focus:border-primary/50 rounded-sm"
          />
          {pinError && <p className="text-xs text-red-500 text-center">Verkeerde PIN. Probeer opnieuw.</p>}
          <button
            onClick={verifyPin}
            disabled={checkingPin || !pinInput}
            data-testid="btn-admin-login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-sm disabled:opacity-50"
          >
            {checkingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inloggen"}
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string }[] = [
    { key: "instellingen", label: "Instellingen" },
    { key: "agenda", label: "Agenda" },
    { key: "slots", label: "Tijdslots" },
    { key: "afspraken", label: "Afspraken" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Tara Pokes" className="h-9 w-9 object-contain" />
          <span className="font-serif text-lg text-foreground/80 italic">Admin</span>
        </div>
        <a href="/" className="text-xs uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors">
          Naar site &rarr;
        </a>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/30 bg-white px-6">
        <div className="flex gap-0 max-w-4xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`tab-${t.key}`}
              className={`px-6 py-4 text-xs uppercase tracking-widest border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/45 hover:text-foreground/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── Agenda ── */}
          {tab === "agenda" && (() => {
            const year = calMonth.getFullYear();
            const month = calMonth.getMonth();
            const monthName = calMonth.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

            // Build grid: Mon-Sun, padded to full weeks
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            // Monday = 0 … Sunday = 6
            const startPad = (firstDay.getDay() + 6) % 7;
            const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;
            const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
              const d = i - startPad + 1;
              if (d < 1 || d > lastDay.getDate()) return null;
              return new Date(year, month, d);
            });

            const slotsByDate: Record<string, Slot[]> = {};
            slots.forEach((s) => {
              if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
              slotsByDate[s.date].push(s);
            });

            function slotColor(slot: Slot) {
              const confirmed = slot.bookings.some((b) => b.status === "confirmed");
              const pending = slot.bookings.some((b) => b.status === "pending");
              if (confirmed) return { bg: "bg-green-100 border-green-300 text-green-800", dot: "bg-green-500" };
              if (pending) return { bg: "bg-amber-100 border-amber-300 text-amber-800", dot: "bg-amber-500" };
              return { bg: "bg-white border-border/40 text-foreground/60", dot: "bg-foreground/20" };
            }

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            return (
              <motion.div key="agenda" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl text-foreground/85">Agenda</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCalMonth(new Date(year, month - 1, 1))}
                      className="p-2 border border-border/40 rounded-sm hover:border-primary/50 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-foreground/60" />
                    </button>
                    <span className="text-sm font-medium text-foreground/70 capitalize min-w-[140px] text-center">{monthName}</span>
                    <button onClick={() => setCalMonth(new Date(year, month + 1, 1))}
                      className="p-2 border border-border/40 rounded-sm hover:border-primary/50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-foreground/60" />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-5 text-xs text-foreground/55">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Bevestigd</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />Aangevraagd</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-foreground/20 inline-block" />Vrij slot</span>
                </div>

                {slotsLoading ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-foreground/30" /></div>
                ) : (
                  <div className="bg-white border border-border/40 rounded-sm overflow-hidden">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 border-b border-border/30">
                      {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
                        <div key={d} className="py-2 text-center text-xs uppercase tracking-wider text-foreground/40 font-medium">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7">
                      {cells.map((date, i) => {
                        const dateStr = date
                          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                          : null;
                        const daySlots = dateStr ? (slotsByDate[dateStr] ?? []) : [];
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDay;

                        return (
                          <div
                            key={i}
                            onClick={() => date && dateStr && setSelectedDay(isSelected ? null : dateStr)}
                            className={`min-h-[90px] p-1.5 border-b border-r border-border/20 transition-colors
                              ${!date ? "bg-background/50" : "cursor-pointer hover:bg-primary/5"}
                              ${isSelected ? "bg-primary/8 ring-1 ring-inset ring-primary/30" : ""}
                              ${i % 7 === 6 ? "border-r-0" : ""}`}
                          >
                            {date && (
                              <>
                                <span className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground/50"}`}>
                                  {date.getDate()}
                                </span>
                                <div className="space-y-1">
                                  {daySlots.map((slot) => {
                                    const { bg, dot } = slotColor(slot);
                                    return (
                                      <div key={slot.id} className={`flex items-center gap-1 px-1.5 py-1 rounded border text-[10px] leading-tight ${bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                                        <span className="truncate">{slot.startTime}–{slot.endTime}</span>
                                      </div>
                                    );
                                  })}
                                  {daySlots.length === 0 && (
                                    <span className="text-[10px] text-foreground/25 italic">Vrij</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day detail panel */}
                <AnimatePresence>
                  {selectedDay && (() => {
                    const daySlots = slotsByDate[selectedDay] ?? [];
                    const dayLabel = new Date(selectedDay + "T00:00:00").toLocaleDateString("nl-NL", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    });
                    return (
                      <motion.div
                        key={selectedDay}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mt-4 bg-white border border-border/40 rounded-sm overflow-hidden"
                      >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                          <h3 className="text-sm font-medium text-foreground/80 capitalize">{dayLabel}</h3>
                          <button onClick={() => setSelectedDay(null)} className="text-foreground/35 hover:text-foreground/70 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {daySlots.length === 0 && (
                          <p className="px-5 pt-8 pb-4 text-sm text-foreground/35 font-light text-center">Geen tijdsloten op deze dag.</p>
                        )}
                        {daySlots.length > 0 && (
                          <div className="divide-y divide-border/20">
                            {daySlots.map((slot) => {
                              const booking = slot.bookings.find((b) => b.status !== "cancelled") ?? null;
                              const { bg } = slotColor(slot);
                              const isEditingThis = reassigning === (booking?.id ?? -slot.id);

                              return (
                                <div key={slot.id} className="px-5 py-4">
                                  {/* Slot time + status */}
                                  <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded ${bg}`}>
                                        <Clock className="w-3 h-3" />
                                        {slot.startTime} – {slot.endTime}
                                      </span>
                                      {booking && (
                                        <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(booking.status)}`}>
                                          {statusLabel(booking.status)}
                                        </span>
                                      )}
                                      {!booking && (
                                        <span className="text-xs text-foreground/35 font-light italic">Vrij slot</span>
                                      )}
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setReassigning(isEditingThis ? null : (booking?.id ?? -slot.id));
                                          setEditDate(slot.date);
                                          setEditStart(slot.startTime);
                                          setEditEnd(slot.endTime);
                                        }}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border/50 rounded-sm text-foreground/55 hover:border-primary/50 hover:text-primary transition-colors"
                                      >
                                        <RefreshCw className="w-3 h-3" /> Wijzig tijdstip
                                      </button>
                                      <button
                                        onClick={() => deleteSlot(slot.id)}
                                        className="p-1.5 text-foreground/30 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline time edit */}
                                  {isEditingThis && (
                                    <div className="mt-3 p-3 bg-background border border-border/30 rounded-sm space-y-2">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-xs text-foreground/40 block mb-1">Datum</label>
                                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                        </div>
                                        <div>
                                          <label className="text-xs text-foreground/40 block mb-1">Van</label>
                                          <input type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                        </div>
                                        <div>
                                          <label className="text-xs text-foreground/40 block mb-1">Tot</label>
                                          <input type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button onClick={async () => { await saveSlotEdit(slot.id); setSelectedDay(editDate); }}
                                          disabled={!editDate || !editStart || !editEnd}
                                          className="px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-sm disabled:opacity-40">
                                          Opslaan
                                        </button>
                                        <button onClick={() => setReassigning(null)}
                                          className="px-4 py-1.5 border border-border/50 text-xs text-foreground/50 rounded-sm hover:border-foreground/40">
                                          Annuleren
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Booking details */}
                                  {booking && (
                                    <div className="mt-3 space-y-1.5">
                                      <div className="flex items-center gap-2 text-sm text-foreground/75">
                                        <User className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                                        <span className="font-medium">{booking.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-foreground/50">
                                        <MailIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        {booking.email}
                                        {booking.phone && <span>· {booking.phone}</span>}
                                      </div>
                                      {booking.message && (
                                        <p className="text-xs text-foreground/45 italic mt-1 leading-relaxed max-w-lg whitespace-pre-line">"{booking.message}"</p>
                                      )}
                                      {booking.photoUrls && booking.photoUrls.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                          <Image className="w-3.5 h-3.5 text-primary/50" />
                                          {booking.photoUrls.map((url, pi) => (
                                            <a key={pi} href={`${BASE}/api/storage/objects/serve?path=${encodeURIComponent(url)}`}
                                              target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                                              Foto {pi + 1}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      {/* Confirm / cancel actions */}
                                      {booking.status !== "cancelled" && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                          {booking.status === "pending" && booking.phone && (
                                            <a
                                              href={whatsappConfirmUrl(booking, slot)!}
                                              target="_blank" rel="noreferrer"
                                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 border border-[#25D366]/40 text-[#1a8c4a] text-xs rounded-sm hover:bg-[#25D366]/20 transition-colors"
                                            >
                                              <MessageCircle className="w-3.5 h-3.5" /> Bevestig via WhatsApp
                                            </a>
                                          )}
                                          {booking.status === "pending" && (
                                            <button
                                              onClick={() => confirmViaEmail(booking.id)}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-sm hover:bg-blue-100 transition-colors"
                                            >
                                              <MailIcon className="w-3.5 h-3.5" /> Bevestig via e-mail
                                            </button>
                                          )}
                                          {booking.status === "pending" && (
                                            <button
                                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-sm hover:bg-green-100 transition-colors"
                                            >
                                              <CheckCircle className="w-3.5 h-3.5" /> Bevestigen
                                            </button>
                                          )}
                                          <button
                                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm hover:bg-red-100 transition-colors"
                                          >
                                            <XCircle className="w-3.5 h-3.5" /> Annuleren
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add slot footer */}
                        <div className="px-5 py-4 border-t border-border/30 bg-background/50">
                          <p className="text-xs uppercase tracking-wider text-foreground/40 mb-3">Tijdslot toevoegen</p>
                          <div className="flex items-end gap-2 flex-wrap">
                            <div>
                              <label className="text-xs text-foreground/40 block mb-1">Van</label>
                              <input type="time" value={daySlotStart} onChange={(e) => setDaySlotStart(e.target.value)}
                                className="px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                              <label className="text-xs text-foreground/40 block mb-1">Tot</label>
                              <input type="time" value={daySlotEnd} onChange={(e) => setDaySlotEnd(e.target.value)}
                                className="px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <button
                              disabled={addingDaySlot || !daySlotStart || !daySlotEnd}
                              onClick={async () => {
                                if (!selectedDay || !daySlotStart || !daySlotEnd) return;
                                setAddingDaySlot(true);
                                try {
                                  const res = await fetch(`${BASE}/api/booking/admin/slots`, {
                                    method: "POST",
                                    headers: authHeaders(pin),
                                    body: JSON.stringify({ date: selectedDay, startTime: daySlotStart, endTime: daySlotEnd }),
                                  });
                                  if (res.ok) await loadSlots();
                                } finally {
                                  setAddingDaySlot(false);
                                }
                              }}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-sm disabled:opacity-40"
                            >
                              {addingDaySlot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                              Toevoegen
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </motion.div>
            );
          })()}

          {/* ── Instellingen ── */}
          {tab === "instellingen" && (
            <motion.div key="instellingen" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground/85 mb-8">Agenda-instellingen</h2>

              <div className="bg-white border border-border/40 rounded-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/80">Online boeken</p>
                    <p className="text-xs text-foreground/45 mt-1 font-light">
                      {enabled ? "Klanten kunnen afspraken plannen via de website." : "De agenda is verborgen op de website."}
                    </p>
                  </div>
                  <button
                    onClick={toggleFeature}
                    disabled={settingsLoading}
                    data-testid="btn-toggle-booking"
                    className="flex items-center gap-2 transition-colors"
                  >
                    {settingsLoading
                      ? <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
                      : enabled
                        ? <ToggleRight className="w-10 h-10 text-primary" />
                        : <ToggleLeft className="w-10 h-10 text-foreground/30" />
                    }
                  </button>
                </div>
              </div>

              <div className="bg-white border border-border/40 rounded-sm p-6">
                <p className="text-sm font-medium text-foreground/80 mb-3">Persoonlijke notitie</p>
                <p className="text-xs text-foreground/45 mb-4 font-light">Interne notitie voor jezelf (niet zichtbaar voor klanten).</p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="bijv. 'Slot vrijdag gereserveerd voor prep'"
                  className="w-full px-4 py-3 border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/50 rounded-sm resize-none"
                />
                <button
                  onClick={saveNote}
                  disabled={settingsLoading}
                  className="mt-3 px-5 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-sm disabled:opacity-50"
                >
                  Opslaan
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Slots ── */}
          {tab === "slots" && (
            <motion.div key="slots" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground/85 mb-8">Tijdslots beheren</h2>

              {/* Add slot form */}
              <div className="bg-white border border-border/40 rounded-sm p-6 mb-8">
                <p className="text-sm font-medium text-foreground/80 mb-4">Nieuw slot toevoegen</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-foreground/45 uppercase tracking-wider mb-1 block">Datum</label>
                    <input
                      type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      data-testid="input-slot-date"
                      className="w-full px-3 py-2.5 border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/50 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/45 uppercase tracking-wider mb-1 block">Van</label>
                    <input
                      type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                      data-testid="input-slot-start"
                      className="w-full px-3 py-2.5 border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/50 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/45 uppercase tracking-wider mb-1 block">Tot</label>
                    <input
                      type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                      data-testid="input-slot-end"
                      className="w-full px-3 py-2.5 border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/50 rounded-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addSlot}
                  disabled={addingSlot || !newDate}
                  data-testid="btn-add-slot"
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-sm disabled:opacity-50"
                >
                  {addingSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Toevoegen
                </button>
              </div>

              {/* Slot list */}
              {slotsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/30" /></div>
              ) : slots.length === 0 ? (
                <p className="text-center text-foreground/40 font-light py-12">Nog geen slots aangemaakt.</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => {
                    const booked = slot.bookings.find((b) => b.status === "confirmed");
                    return (
                      <div key={slot.id} className={`bg-white border rounded-sm p-4 flex items-center justify-between gap-4 ${!slot.isActive ? "opacity-50" : ""} ${booked ? "border-green-200" : "border-border/40"}`}>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-primary/50 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-foreground/80">
                              {new Date(slot.date + "T00:00:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <p className="text-xs text-foreground/45 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {slot.startTime} – {slot.endTime}
                              {booked && <span className="ml-2 text-green-600 font-medium">· Geboekt door {booked.name}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleSlot(slot.id, slot.isActive)}
                            className="text-xs px-3 py-1.5 border border-border/50 rounded-sm text-foreground/60 hover:border-foreground/40 transition-colors"
                          >
                            {slot.isActive ? "Deactiveren" : "Activeren"}
                          </button>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="p-1.5 text-foreground/30 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Afspraken ── */}
          {tab === "afspraken" && (
            <motion.div key="afspraken" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-2xl text-foreground/85 mb-8">Afspraken overzicht</h2>
              {bookingsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground/30" /></div>
              ) : bookingsList.length === 0 ? (
                <p className="text-center text-foreground/40 font-light py-12">Nog geen afspraken ontvangen.</p>
              ) : (
                <div className="space-y-4">
                  {bookingsList.map(({ booking, slot }) => (
                    <div key={booking.id} className="bg-white border border-border/40 rounded-sm p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary/50" />
                            <span className="text-sm font-medium text-foreground/80">{booking.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(booking.status)}`}>
                              {statusLabel(booking.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-foreground/50">
                            <MailIcon className="w-3.5 h-3.5" /> {booking.email}
                            {booking.phone && <span>· {booking.phone}</span>}
                          </div>
                          {slot && (
                            <div className="flex items-center gap-2 text-xs text-foreground/50">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(slot.date + "T00:00:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} · {slot.startTime} – {slot.endTime}
                            </div>
                          )}
                          {booking.message && (
                            <p className="text-xs text-foreground/50 italic mt-1 max-w-md">"{booking.message}"</p>
                          )}
                          {booking.photoUrls && booking.photoUrls.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Image className="w-3.5 h-3.5 text-primary/50" />
                              {booking.photoUrls.map((url, pi) => (
                                <a key={pi} href={`${BASE}/api/storage/objects/serve?path=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"
                                  className="text-xs text-primary underline">
                                  Foto {pi + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                          {booking.status === "pending" && (
                            <div className="flex gap-2 flex-wrap justify-end">
                              {booking.phone && (
                                <a
                                  href={whatsappConfirmUrl(booking, slot)!}
                                  target="_blank" rel="noreferrer"
                                  onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 border border-[#25D366]/40 text-[#1a8c4a] text-xs rounded-sm hover:bg-[#25D366]/20 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> Bevestig via WhatsApp
                                </a>
                              )}
                              <button
                                onClick={() => confirmViaEmail(booking.id)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-sm hover:bg-blue-100 transition-colors"
                              >
                                <MailIcon className="w-3.5 h-3.5" /> Bevestig via e-mail
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-sm hover:bg-green-100 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Bevestigen
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm hover:bg-red-100 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Annuleren
                              </button>
                            </div>
                          )}
                          {/* Slot time edit */}
                          {reassigning === booking.id && slot ? (
                            <div className="mt-2 space-y-2 border border-border/40 rounded-sm p-3 bg-background">
                              <p className="text-xs uppercase tracking-wider text-foreground/40 mb-2">Wijzig tijdstip</p>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-foreground/40 block mb-1">Datum</label>
                                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                </div>
                                <div>
                                  <label className="text-xs text-foreground/40 block mb-1">Van</label>
                                  <input type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                </div>
                                <div>
                                  <label className="text-xs text-foreground/40 block mb-1">Tot</label>
                                  <input type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-border/50 text-xs rounded-sm bg-white focus:outline-none focus:border-primary/50" />
                                </div>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => saveSlotEdit(slot.id)}
                                  disabled={!editDate || !editStart || !editEnd}
                                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs rounded-sm disabled:opacity-40"
                                >
                                  Opslaan
                                </button>
                                <button onClick={() => setReassigning(null)}
                                  className="px-4 py-1.5 border border-border/50 text-xs text-foreground/50 rounded-sm hover:border-foreground/40">
                                  Annuleren
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startReassign({ booking, slot })}
                              className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors mt-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Wijzig tijdstip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
