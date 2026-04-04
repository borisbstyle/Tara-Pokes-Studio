import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Mail, MapPin, Plus, Minus, MessageCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import BookingSection from "@/components/BookingSection";

import logoImg  from "@/assets/logo.png";
import heroImg  from "@assets/IMG_7754_1775294371663.jpeg";
import gal1     from "@assets/IMG_7753_1775294371663.jpeg";
import gal2     from "@assets/IMG_7752_1775294371663.jpeg";
import gal3     from "@assets/IMG_7751_1775294371663.jpeg";
import flashImg from "@assets/IMG_7749_1775294371663.jpeg";
import quoteImg from "@assets/IMG_7748_1775294371663.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.13 } },
};

export default function Home() {
  const { t, lang, toggle } = useLang();
  const { scrollYProgress } = useScroll();
  const heroY       = useTransform(scrollYProgress, [0, 0.2], ["0%", "12%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.2]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* ── NAV ── */}
      <nav className="absolute top-0 w-full z-40 px-6 py-5 md:px-12 flex justify-between items-center pointer-events-auto">
        <a href="/">
          <img src={logoImg} alt="Tara Pokes" className="h-13 w-13 object-contain" />
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm font-light tracking-wider">
          <a href="#werk"    className="hover:text-primary transition-colors" data-testid="link-work">{t.nav.work}</a>
          <a href="#waarom"  className="hover:text-primary transition-colors" data-testid="link-why">{t.nav.why}</a>
          <a href="#reviews" className="hover:text-primary transition-colors" data-testid="link-reviews">{t.nav.reviews}</a>
          <a href="#flash"   className="hover:text-primary transition-colors" data-testid="link-flash">{t.nav.flash}</a>
          <a href="#afspraak" className="hover:text-primary transition-colors" data-testid="link-booking">{t.nav.booking}</a>
          <button onClick={toggle} data-testid="button-lang-toggle"
            className="ml-1 px-3 py-1 text-xs tracking-widest uppercase border border-foreground/25 hover:border-primary/70 hover:text-primary transition-colors rounded-sm">
            {t.langToggle}
          </button>
        </div>
        <button onClick={toggle} data-testid="button-lang-toggle-mobile"
          className="md:hidden px-3 py-1 text-xs tracking-widest uppercase border border-foreground/25 hover:border-primary/70 hover:text-primary transition-colors rounded-sm">
          {t.langToggle}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-[100dvh] w-full flex items-end overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-full" style={{ y: heroY, opacity: heroOpacity }}>
          <img src={heroImg} alt="Tara aan het ontwerpen" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-20 md:pb-28 max-w-4xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="text-xs uppercase tracking-widest text-primary mb-5 font-light">
            {t.hero.location}
          </motion.p>
          <AnimatePresence mode="wait">
            <motion.h1 key={lang + "-h1"} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-foreground mb-4 leading-tight">
              {t.hero.title}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p key={lang + "-sub"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-xl md:text-2xl text-foreground/75 font-light italic mb-3">
              {t.hero.subtitle}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p key={lang + "-extra"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-sm md:text-base text-foreground/55 font-light mb-10 max-w-md">
              {t.hero.extra}
            </motion.p>
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4">
            <a href="#afspraak" data-testid="btn-hero-book"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-sm">
              <MessageCircle className="w-4 h-4" /> {t.hero.cta1}
            </a>
            <a href="#werk" data-testid="btn-hero-work"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-foreground/30 text-foreground/80 text-xs uppercase tracking-widest hover:border-foreground/60 transition-colors rounded-sm">
              {t.hero.cta2} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-foreground/30 font-light">{t.hero.scroll}</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-foreground/20 to-transparent" />
        </motion.div>
      </section>

      <BookingSection />

      {/* ── PORTFOLIO ── */}
      <section id="werk" className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="text-center mb-14 md:mb-20">
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-3 block">
            {t.portfolio.label}
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-port-h"} variants={fadeUp}
              className="text-3xl md:text-5xl font-serif text-foreground/90 mb-4">
              {t.portfolio.title}
            </motion.h2>
          </AnimatePresence>
          <motion.p variants={fadeUp} className="text-foreground/55 font-light max-w-md mx-auto text-sm md:text-base">
            {t.portfolio.subtitle}
          </motion.p>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="md:col-span-7 aspect-[4/5]">
            <img src={gal1} alt="Vlinder tattoo" className="w-full h-full object-cover rounded-sm" />
          </motion.div>
          <div className="md:col-span-5 flex flex-col gap-5 md:gap-6 md:pt-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }} className="aspect-[4/3]">
              <img src={gal2} alt="Drie bijpassende tattoos" className="w-full h-full object-cover rounded-sm" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="aspect-[4/3]">
              <img src={gal3} alt="Bloemen tattoo" className="w-full h-full object-cover rounded-sm" />
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }}
          className="mt-10 text-center">
          <a href="https://instagram.com/tara.pokes" target="_blank" rel="noreferrer"
            data-testid="btn-more-work"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground/50 hover:text-primary border-b border-foreground/20 hover:border-primary pb-1 transition-colors">
            <Instagram className="w-3.5 h-3.5" /> Meer werk op Instagram
          </a>
        </motion.div>
      </section>

      {/* ── WAAROM ── */}
      <section id="waarom" className="py-24 md:py-32 bg-white border-y border-border/30">
        <div className="px-6 md:px-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-4 block" />
              <AnimatePresence mode="wait">
                <motion.h2 key={lang + "-why-h"} variants={fadeUp}
                  className="text-3xl md:text-4xl font-serif text-foreground/90 mb-10 leading-snug">
                  {t.why.title}
                </motion.h2>
              </AnimatePresence>
              <ul className="space-y-4">
                {t.why.bullets.map((b, i) => (
                  <motion.li key={lang + "-why-" + i} variants={fadeUp}
                    className="flex items-start gap-3 text-foreground/70 font-light text-sm md:text-base">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {b}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Portrait of Tara with quote photo */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }} viewport={{ once: true }}
              className="aspect-[3/4]">
              <img src={quoteImg} alt="Tara Pokes" className="w-full h-full object-cover object-center rounded-sm" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-24 md:py-32 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="text-center mb-14">
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-rev-h"} variants={fadeUp}
              className="text-3xl md:text-4xl font-serif text-foreground/90">
              {t.reviews.title}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.reviews.items.map((r, i) => (
            <motion.div key={lang + "-rev-" + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-border/40 rounded-sm p-7 flex flex-col justify-between gap-5">
              <p className="font-serif text-base md:text-lg italic text-foreground/70 leading-relaxed font-light">
                &ldquo;{r.quote}&rdquo;
              </p>
              <p className="text-xs uppercase tracking-widest text-primary/60">— {r.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FLASH DESIGNS ── */}
      <section id="flash" className="py-24 md:py-32 bg-white border-y border-border/30">
        <div className="px-6 md:px-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }} viewport={{ once: true }}
              className="aspect-[4/3] order-2 md:order-1">
              <img src={flashImg} alt="Flash designs" className="w-full h-full object-cover rounded-sm" />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="order-1 md:order-2">
              <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">
                {t.flash.label}
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.h2 key={lang + "-flash-h"} variants={fadeUp}
                  className="text-3xl md:text-4xl font-serif text-foreground/90 mb-6">
                  {t.flash.title}
                </motion.h2>
              </AnimatePresence>
              <motion.p variants={fadeUp}
                className="text-foreground/60 font-light text-base md:text-lg leading-relaxed mb-8 whitespace-pre-line">
                {t.flash.text}
              </motion.p>
              <motion.div variants={fadeUp}>
                <a href="https://wa.me/31613415766" target="_blank" rel="noreferrer"
                  data-testid="btn-flash-cta"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-sm">
                  <MessageCircle className="w-4 h-4" /> {t.flash.cta}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOE HET WERKT ── */}
      <section id="hoe-het-werkt" className="py-24 md:py-32 px-6 md:px-12 max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="text-center mb-16">
          <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-3 block">
            {t.howItWorks.label}
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-how-h"} variants={fadeUp}
              className="text-3xl md:text-4xl font-serif text-foreground/90">
              {t.howItWorks.title}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {t.howItWorks.steps.map((step, i) => (
            <motion.div key={lang + "-step-" + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="flex flex-col items-start border-t-2 border-primary/30 pt-6">
              <span className="text-2xl font-serif text-primary/40 mb-3 font-light">{step.num}</span>
              <p className="text-foreground/70 font-light text-sm leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HYGIËNE ── */}
      <section className="py-20 md:py-28 bg-white border-y border-border/30">
        <div className="px-6 md:px-12 max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">
              {t.hygiene.label}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang + "-hyg-h"} variants={fadeUp}
                className="text-3xl md:text-4xl font-serif text-foreground/90 mb-7">
                {t.hygiene.title}
              </motion.h2>
            </AnimatePresence>
            <motion.p variants={fadeUp}
              className="text-foreground/60 font-light text-base md:text-lg leading-relaxed whitespace-pre-line">
              {t.hygiene.text}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 md:py-32 px-6 md:px-12 max-w-3xl mx-auto border-t border-border/30">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">{t.faq.label}</span>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-faq-h"} className="text-3xl md:text-4xl font-serif text-foreground/90">
              {t.faq.title}
            </motion.h2>
          </AnimatePresence>
        </motion.div>
        <div className="flex flex-col gap-1">
          {t.faq.items.map((faq, i) => (
            <motion.div key={lang + "-faq-" + i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
              className="border-b border-border/40">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left py-5 flex justify-between items-center text-foreground/85 font-serif text-lg"
                data-testid={`btn-faq-${i}`}>
                {faq.q}
                <span className="text-primary/50 ml-4 flex-shrink-0">
                  {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pb-6 pr-8 text-foreground/55 font-light text-sm leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOOKING CONTACT ── */}
      <section id="afspraak" className="py-24 md:py-32 px-6 md:px-12 border-t border-border/30 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="text-xs uppercase tracking-widest text-primary/70 mb-5 block">
              {t.booking.label}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang + "-book-h"} variants={fadeUp}
                className="text-3xl md:text-5xl font-serif mb-6 text-foreground/90 font-light">
                {t.booking.title}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p key={lang + "-book-p"} variants={fadeUp}
                className="text-foreground/55 font-light text-base max-w-md mx-auto mb-10 leading-relaxed">
                {t.booking.text}
              </motion.p>
            </AnimatePresence>
            <motion.div variants={fadeUp}
              className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <a href="https://wa.me/31613415766" target="_blank" rel="noreferrer"
                data-testid="btn-whatsapp-booking"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm">
                <MessageCircle className="w-4 h-4" /> {t.booking.whatsapp}
              </a>
              <a href="https://instagram.com/tara.pokes" target="_blank" rel="noreferrer"
                data-testid="btn-ig-booking"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-border/70 hover:border-primary/50 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm">
                <Instagram className="w-4 h-4" /> {t.booking.instagram}
              </a>
              <a href="mailto:tara@tarapokes.com" data-testid="btn-email-booking"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-border/70 hover:border-primary/50 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm">
                <Mail className="w-4 h-4" /> {t.booking.email}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 md:px-12 border-t border-border/30 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <img src={logoImg} alt="Tara Pokes" className="h-10 w-10 object-contain opacity-70" />
          <div className="flex items-center gap-2 text-foreground/40 text-sm font-light">
            <MapPin className="w-3.5 h-3.5" /><span>{t.footer.location}</span>
          </div>
          <p className="text-foreground/30 text-xs font-light uppercase tracking-wider">
            &copy; {new Date().getFullYear()} {t.footer.copy}
          </p>
        </div>
      </footer>
    </main>
  );
}
