import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle, Loader2, MessageCircle, Instagram, Mail } from "lucide-react";
import { useLang } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

type Step = "slots" | "form" | "done";

function formatDate(dateStr: string, lang: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(slots: Slot[]) {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date)!.push(s);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function BookingSection() {
  const { t, lang } = useLang();
  const [enabled, setEnabled] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<Step>("slots");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/booking/status`)
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled);
        setSlots(data.slots ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !enabled) return null;

  const grouped = groupByDate(slots);
  const bl = lang === "nl" ? {
    label: "Agenda",
    heading: "Plan een Afspraak",
    body: "Kies hieronder een beschikbaar tijdslot en vul je gegevens in. Tara bevestigt je afspraak via e-mail.",
    noSlots: "Er zijn momenteel geen beschikbare slots. Neem contact op via WhatsApp of Instagram.",
    selectSlot: "Kies een tijdslot",
    yourDetails: "Jouw gegevens",
    namePlaceholder: "Naam",
    emailPlaceholder: "E-mailadres",
    phonePlaceholder: "Telefoonnummer (optioneel)",
    messagePlaceholder: "Vertel iets over je tattooidee (optioneel)",
    back: "Terug",
    confirm: "Afspraak Bevestigen",
    successTitle: "Aanvraag ontvangen!",
    successBody: "Tara neemt zo snel mogelijk contact met je op om de afspraak te bevestigen.",
    chosen: "Gekozen tijdslot:",
    errorRequired: "Naam en e-mailadres zijn verplicht.",
    errorGeneric: "Er ging iets mis. Probeer het opnieuw.",
  } : {
    label: "Agenda",
    heading: "Book an Appointment",
    body: "Choose an available time slot below and fill in your details. Tara will confirm your appointment by email.",
    noSlots: "No slots are currently available. Reach out via WhatsApp or Instagram.",
    selectSlot: "Choose a time slot",
    yourDetails: "Your details",
    namePlaceholder: "Name",
    emailPlaceholder: "Email address",
    phonePlaceholder: "Phone number (optional)",
    messagePlaceholder: "Tell us a bit about your tattoo idea (optional)",
    back: "Back",
    confirm: "Confirm Appointment",
    successTitle: "Request received!",
    successBody: "Tara will get back to you as soon as possible to confirm your appointment.",
    chosen: "Chosen slot:",
    errorRequired: "Name and email address are required.",
    errorGeneric: "Something went wrong. Please try again.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError(bl.errorRequired); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/booking/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot!.id, name, email, phone, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? bl.errorGeneric);
        return;
      }
      setStep("done");
    } catch {
      setError(bl.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="agenda" className="py-28 md:py-36 px-6 md:px-12 border-t border-border/30 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">{bl.label}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground/90 mb-4">{bl.heading}</h2>
          <p className="text-foreground/55 font-light text-base max-w-lg mx-auto leading-relaxed">{bl.body}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-16 flex flex-col items-center gap-4"
            >
              <CheckCircle className="w-12 h-12 text-primary" />
              <h3 className="text-2xl font-serif text-foreground/90">{bl.successTitle}</h3>
              <p className="text-foreground/55 font-light max-w-sm">{bl.successBody}</p>
            </motion.div>
          )}

          {step === "slots" && (
            <motion.div key="slots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {grouped.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground/50 font-light mb-8">{bl.noSlots}</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="https://wa.me/31613415766" target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-sm">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a href="https://instagram.com/tara.pokes" target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-border/70 text-xs uppercase tracking-widest rounded-sm">
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-xs uppercase tracking-widest text-foreground/40 text-center">{bl.selectSlot}</p>
                  {grouped.map(([date, daySlots]) => (
                    <div key={date}>
                      <p className="text-sm font-medium text-foreground/70 mb-3 capitalize">{formatDate(date, lang)}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {daySlots.map((slot) => (
                          <button
                            key={slot.id}
                            data-testid={`slot-${slot.id}`}
                            onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                            className="flex items-center gap-2 px-4 py-3 border border-border/60 hover:border-primary hover:bg-primary/5 transition-all text-sm text-left rounded-sm group"
                          >
                            <Clock className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                            <span className="text-foreground/80">{slot.startTime} – {slot.endTime}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === "form" && selectedSlot && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8 p-4 bg-white border border-border/40 rounded-sm flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground/45 uppercase tracking-wider">{bl.chosen}</p>
                  <p className="text-sm text-foreground/80 font-medium capitalize">
                    {formatDate(selectedSlot.date, lang)} · {selectedSlot.startTime} – {selectedSlot.endTime}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-foreground/40 mb-2">{bl.yourDetails}</p>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={bl.namePlaceholder} data-testid="input-booking-name"
                  className="w-full px-4 py-3 border border-border/50 bg-white text-sm text-foreground focus:outline-none focus:border-primary/50 rounded-sm transition-colors"
                />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={bl.emailPlaceholder} data-testid="input-booking-email"
                  className="w-full px-4 py-3 border border-border/50 bg-white text-sm text-foreground focus:outline-none focus:border-primary/50 rounded-sm transition-colors"
                />
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder={bl.phonePlaceholder} data-testid="input-booking-phone"
                  className="w-full px-4 py-3 border border-border/50 bg-white text-sm text-foreground focus:outline-none focus:border-primary/50 rounded-sm transition-colors"
                />
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder={bl.messagePlaceholder} rows={3} data-testid="input-booking-message"
                  className="w-full px-4 py-3 border border-border/50 bg-white text-sm text-foreground focus:outline-none focus:border-primary/50 rounded-sm transition-colors resize-none"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("slots")}
                    className="px-6 py-3 border border-border/60 text-xs uppercase tracking-widest text-foreground/60 hover:border-foreground/40 transition-colors rounded-sm">
                    {bl.back}
                  </button>
                  <button type="submit" disabled={submitting} data-testid="btn-booking-submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors rounded-sm">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {bl.confirm}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
