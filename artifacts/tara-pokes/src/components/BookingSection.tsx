import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle, Loader2, MessageCircle, Instagram, ImagePlus, X } from "lucide-react";
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

async function uploadPhoto(file: File): Promise<string | null> {
  try {
    const metaRes = await fetch(`${BASE}/api/storage/uploads/request-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
    });
    if (!metaRes.ok) return null;
    const { uploadURL, objectPath } = await metaRes.json();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) return null;
    return objectPath as string;
  } catch {
    return null;
  }
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
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    messagePlaceholder: "Jouw bericht...",
    messageTemplate: `Wat leuk dat je contact met me opneemt!\n\nOm een afspraak te maken heb ik de volgende informatie van je nodig:\n\n✣  Een korte beschrijving van wat je getatoeëerd wilt hebben\n✣  De plek waar je de tattoo(s) graag wilt\n\nVoeg hieronder gerust inspiratiefoto's en voorbeelden toe via de upload-knop.\n\n[Vul hier je antwoorden in]`,
    addPhotos: "Voeg inspiratiefoto's toe",
    addPhotosHint: "Max. 5 foto's · JPG, PNG, WEBP",
    back: "Terug",
    confirm: "Afspraak Bevestigen",
    uploading: "Foto's uploaden...",
    successTitle: "Aanvraag ontvangen!",
    successBody: "Tara neemt zo snel mogelijk contact met je op.",
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
    messagePlaceholder: "Your message...",
    messageTemplate: `How lovely that you reached out!\n\nTo make an appointment I'll need the following from you:\n\n✣  A short description of what you'd like tattooed\n✣  The spot where you'd like the tattoo(s)\n\nFeel free to add inspiration photos and examples below via the upload button.\n\n[Fill in your answers here]`,
    addPhotos: "Add inspiration photos",
    addPhotosHint: "Max. 5 photos · JPG, PNG, WEBP",
    back: "Back",
    confirm: "Confirm Appointment",
    uploading: "Uploading photos...",
    successTitle: "Request received!",
    successBody: "Tara will get back to you as soon as possible.",
    chosen: "Chosen slot:",
    errorRequired: "Name and email address are required.",
    errorGeneric: "Something went wrong. Please try again.",
  };

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setPhotos(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  }

  function removePhoto(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError(bl.errorRequired); return; }
    setError("");
    setSubmitting(true);

    let photoUrls: string[] = [];
    if (photos.length > 0) {
      setUploading(true);
      const results = await Promise.all(photos.map(uploadPhoto));
      photoUrls = results.filter(Boolean) as string[];
      setUploading(false);
    }

    try {
      const res = await fetch(`${BASE}/api/booking/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot!.id,
          name,
          email,
          phone,
          message,
          photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        }),
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
              className="py-12 flex flex-col items-center gap-6"
            >
              <CheckCircle className="w-12 h-12 text-primary" />
              <h3 className="text-2xl font-serif text-foreground/90 text-center">{bl.successTitle}</h3>
              <p className="text-foreground/55 font-light text-center max-w-sm">{bl.successBody}</p>
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
                            onClick={() => { setSelectedSlot(slot); setMessage(bl.messageTemplate); setStep("form"); }}
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
                  placeholder={bl.messagePlaceholder} rows={9} data-testid="input-booking-message"
                  className="w-full px-4 py-3 border border-border/50 bg-white text-sm text-foreground focus:outline-none focus:border-primary/50 rounded-sm transition-colors resize-none leading-relaxed"
                />

                {/* Photo upload */}
                <div className="border border-dashed border-border/60 rounded-sm p-4 bg-white">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                    data-testid="input-booking-photos"
                  />
                  {photoPreviews.length === 0 ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 py-3 text-foreground/45 hover:text-primary transition-colors">
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs uppercase tracking-wider">{bl.addPhotos}</span>
                      <span className="text-xs text-foreground/30">{bl.addPhotosHint}</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {photoPreviews.map((src, i) => (
                          <div key={i} className="relative w-20 h-20 group">
                            <img src={src} alt="" className="w-full h-full object-cover rounded-sm" />
                            <button type="button" onClick={() => removePhoto(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {photos.length < 5 && (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 border border-dashed border-border/50 rounded-sm flex items-center justify-center text-foreground/30 hover:text-primary hover:border-primary transition-colors">
                            <ImagePlus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("slots")}
                    className="px-6 py-3 border border-border/60 text-xs uppercase tracking-widest text-foreground/60 hover:border-foreground/40 transition-colors rounded-sm">
                    {bl.back}
                  </button>
                  <button type="submit" disabled={submitting || uploading} data-testid="btn-booking-submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors rounded-sm">
                    {(submitting || uploading) ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? bl.uploading : ""}</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> {bl.confirm}</>
                    )}
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
