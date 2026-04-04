import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle, XCircle, Clock, Calendar, User, Mail as MailIcon, Image, RefreshCw } from "lucide-react";
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

type Tab = "instellingen" | "slots" | "afspraken";

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
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [reassigning, setReassigning] = useState<number | null>(null);
  const [reassignSlotId, setReassignSlotId] = useState<string>("");

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
      const [bRes, sRes] = await Promise.all([
        fetch(`${BASE}/api/booking/admin/bookings`, { headers: { Authorization: `Bearer ${pin}` } }),
        fetch(`${BASE}/api/booking/admin/slots`, { headers: { Authorization: `Bearer ${pin}` } }),
      ]);
      if (bRes.ok) setBookingsList(await bRes.json());
      if (sRes.ok) setAllSlots(await sRes.json());
    } finally {
      setBookingsLoading(false);
    }
  }

  async function reassignSlot(bookingId: number) {
    if (!reassignSlotId) return;
    await fetch(`${BASE}/api/booking/admin/bookings/${bookingId}/slot`, {
      method: "PATCH",
      headers: authHeaders(pin),
      body: JSON.stringify({ slotId: Number(reassignSlotId) }),
    });
    setReassigning(null);
    setReassignSlotId("");
    await loadBookings();
  }

  useEffect(() => {
    if (!pin) return;
    if (tab === "slots") loadSlots();
    if (tab === "afspraken") loadBookings();
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
    await loadBookings();
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
                            <div className="flex gap-2">
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
                          {/* Slot reassignment */}
                          {reassigning === booking.id ? (
                            <div className="flex gap-2 items-center mt-1">
                              <select
                                value={reassignSlotId}
                                onChange={(e) => setReassignSlotId(e.target.value)}
                                className="text-xs border border-border/60 rounded-sm px-2 py-1.5 bg-white focus:outline-none"
                              >
                                <option value="">— Kies slot —</option>
                                {allSlots.filter((s) => s.isActive && s.id !== booking.slotId).map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {new Date(s.date + "T00:00:00").toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} · {s.startTime}–{s.endTime}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => reassignSlot(booking.id)}
                                disabled={!reassignSlotId}
                                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-sm disabled:opacity-40"
                              >
                                Opslaan
                              </button>
                              <button onClick={() => { setReassigning(null); setReassignSlotId(""); }}
                                className="text-xs text-foreground/40 hover:text-foreground/70">
                                Annuleren
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReassigning(booking.id); setReassignSlotId(""); }}
                              className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors mt-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Verander tijdslot
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
