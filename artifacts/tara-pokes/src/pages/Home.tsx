import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Mail, MapPin, Plus, Minus, MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import BookingSection from "@/components/BookingSection";

import logoImg    from "@/assets/logo.png";
import heroImg    from "@assets/IMG_7754_1775294371663.jpeg";
import aboutImg   from "@assets/IMG_7751_1775294371663.jpeg";
import gallery1   from "@assets/IMG_7753_1775294371663.jpeg";
import gallery2   from "@assets/IMG_7752_1775294371663.jpeg";
import gallery3   from "@assets/IMG_7749_1775294371663.jpeg";
import quoteImg   from "@assets/IMG_7748_1775294371663.jpeg";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function Home() {
  const { t, lang, toggle } = useLang();
  const { scrollYProgress } = useScroll();
  const heroY       = useTransform(scrollYProgress, [0, 0.2], ["0%", "12%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.15]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* ── Navigation ── */}
      <nav className="absolute top-0 w-full z-40 px-6 py-6 md:px-12 flex justify-between items-center pointer-events-auto">
        <img src={logoImg} alt="Tara Pokes logo" className="h-14 w-14 object-contain" />
        <div className="hidden md:flex items-center gap-8 text-sm font-light tracking-wider">
          <a href="#about"      className="hover:text-primary transition-colors" data-testid="link-about">{t.nav.about}</a>
          <a href="#philosophy" className="hover:text-primary transition-colors" data-testid="link-philosophy">{t.nav.philosophy}</a>
          <a href="#process"    className="hover:text-primary transition-colors" data-testid="link-process">{t.nav.process}</a>
          <a href="#work"       className="hover:text-primary transition-colors" data-testid="link-work">{t.nav.work}</a>
          <a href="#faq"        className="hover:text-primary transition-colors" data-testid="link-faq">{t.nav.faq}</a>
          <a href="#booking"    className="hover:text-primary transition-colors" data-testid="link-booking">{t.nav.booking}</a>
          <button
            onClick={toggle}
            data-testid="button-lang-toggle"
            className="ml-2 px-3 py-1 text-xs tracking-widest uppercase border border-foreground/25 hover:border-primary/70 hover:text-primary transition-colors rounded-sm"
          >
            {t.langToggle}
          </button>
        </div>
        <button
          onClick={toggle}
          data-testid="button-lang-toggle-mobile"
          className="md:hidden px-3 py-1 text-xs tracking-widest uppercase border border-foreground/25 hover:border-primary/70 hover:text-primary transition-colors rounded-sm"
        >
          {t.langToggle}
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-[100dvh] w-full flex items-end overflow-hidden">
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <img
            src={heroImg}
            alt="Tara aan het ontwerpen"
            className="w-full h-full object-cover object-top"
          />
          {/* gradient: dark at bottom so text reads, transparent at top so face is visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-20 md:pb-28">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-primary mb-4 font-light"
          >
            {t.hero.location}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-light text-foreground mb-4 leading-none"
          >
            Tara Pokes
          </motion.h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={lang}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-base md:text-lg text-foreground/70 font-light max-w-md"
            >
              {t.hero.tagline} {t.hero.sub}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-xs uppercase tracking-widest text-foreground/35 font-light">{t.hero.scroll}</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-foreground/25 to-transparent" />
        </motion.div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-28 md:py-36 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="order-2 md:order-1"
          >
            <AnimatePresence mode="wait">
              <motion.h2
                key={lang + "-about-h"}
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-serif mb-8 text-foreground/90 leading-tight"
              >
                {t.about.heading}
              </motion.h2>
            </AnimatePresence>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/65 mb-6 leading-relaxed font-light">
              {t.about.p1}
            </motion.p>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/65 mb-10 leading-relaxed font-light">
              {t.about.p2}
            </motion.p>
            <motion.div variants={fadeInUp}>
              <a
                href="#booking"
                className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b border-primary/40 pb-1 hover:border-primary transition-colors text-primary"
                data-testid="link-book-now"
              >
                {t.about.cta} <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>

          {/* Real tattoo photo — portrait with subtle frame */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="order-1 md:order-2 aspect-[3/4] relative"
          >
            <img
              src={aboutImg}
              alt="Fijnlijn bloemen tattoo op arm"
              className="w-full h-full object-cover rounded-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section id="philosophy" className="py-28 md:py-36 px-6 md:px-12 bg-white border-y border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs uppercase tracking-widest text-primary/70 mb-6 block">
              {t.philosophy.label}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.h2
                key={lang + "-phil-h"}
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-serif italic mb-10 text-foreground/90 font-light"
              >
                {t.philosophy.heading}
              </motion.h2>
            </AnimatePresence>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/65 mb-8">
              {t.philosophy.p1}
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/65">
              {t.philosophy.p2}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="py-28 md:py-36">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">{t.process.label}</span>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang + "-proc-h"} className="text-4xl md:text-5xl font-serif text-foreground/90">
                {t.process.heading}
              </motion.h2>
            </AnimatePresence>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {t.process.steps.map((step, i) => (
              <motion.div
                key={lang + "-step-" + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex flex-col border-t border-border/50 pt-8"
              >
                <h3 className="text-xl font-serif mb-4 text-foreground/90">{step.title}</h3>
                <p className="text-foreground/55 font-light text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery / Work ── */}
      <section id="work" className="py-28 md:py-36 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-border/30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4">{t.gallery.label}</span>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-gal-h"} className="text-4xl md:text-6xl font-serif italic text-foreground/90 font-light">
              {t.gallery.heading}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        {/* Row 1: large left (butterfly) + two right (three arms, flash sheet) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-7 aspect-[4/5]"
          >
            <img
              src={gallery1}
              alt="Vlinder tattoo op arm"
              className="w-full h-full object-cover rounded-sm"
            />
          </motion.div>

          <div className="md:col-span-5 flex flex-col gap-6 md:gap-8 md:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              viewport={{ once: true }}
              className="aspect-[4/3]"
            >
              <img
                src={gallery2}
                alt="Drie bijpassende fijnlijn tattoos"
                className="w-full h-full object-cover rounded-sm"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
              viewport={{ once: true }}
              className="aspect-[4/3]"
            >
              <img
                src={gallery3}
                alt="Flash ontwerpen — mini tattoo kaartjes"
                className="w-full h-full object-cover rounded-sm"
              />
            </motion.div>
          </div>
        </div>

        {/* Row 2: quote card + newspaper personality photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
          <div className="flex items-center justify-center p-12 md:p-16 bg-white border border-border/30 rounded-sm order-2 md:order-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={lang + "-quote"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="font-serif text-xl md:text-2xl text-center italic text-foreground/65 max-w-sm leading-relaxed font-light"
              >
                {t.gallery.quote}
              </motion.p>
            </AnimatePresence>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="aspect-[4/3] order-1 md:order-2"
          >
            <img
              src={quoteImg}
              alt="Ze wil geen bloemen — ze wil een tattoo"
              className="w-full h-full object-cover object-center rounded-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Booking Section (shown only when enabled in admin) ── */}
      <BookingSection />

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 md:py-36 px-6 md:px-12 max-w-3xl mx-auto border-t border-border/30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">{t.faq.label}</span>
          <AnimatePresence mode="wait">
            <motion.h2 key={lang + "-faq-h"} className="text-3xl md:text-4xl font-serif text-foreground/90">
              {t.faq.heading}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-col gap-1">
          {t.faq.items.map((faq, i) => (
            <motion.div
              key={lang + "-faq-" + i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="border-b border-border/50"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left py-5 flex justify-between items-center text-foreground/85 font-serif text-lg md:text-xl"
                data-testid={`btn-faq-${i}`}
              >
                {faq.q}
                <span className="text-primary/50 ml-4 flex-shrink-0">
                  {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pr-8 text-foreground/55 font-light text-sm md:text-base leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Booking ── */}
      <section id="booking" className="py-28 md:py-36 px-6 md:px-12 border-t border-border/30 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs uppercase tracking-widest text-primary/70 mb-6 block">
              {t.booking.label}
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang + "-book-h"} variants={fadeInUp} className="text-4xl md:text-5xl font-serif mb-8 text-foreground/90 font-light">
                {t.booking.heading}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p key={lang + "-book-p"} variants={fadeInUp} className="text-foreground/55 font-light text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
                {t.booking.body}
              </motion.p>
            </AnimatePresence>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 items-center max-w-2xl mx-auto">
              <a
                href="https://wa.me/31613415766"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                data-testid="btn-whatsapp-booking"
              >
                <MessageCircle className="w-4 h-4" />
                {t.booking.whatsapp}
              </a>
              <a
                href="https://instagram.com/tara.pokes"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-border/70 hover:border-primary/50 hover:bg-secondary/40 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                data-testid="btn-ig-booking"
              >
                <Instagram className="w-4 h-4" />
                {t.booking.instagram}
              </a>
              <a
                href="mailto:tara@tarapokes.com"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-border/70 hover:border-primary/50 hover:bg-secondary/40 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                data-testid="btn-email-booking"
              >
                <Mail className="w-4 h-4" />
                {t.booking.email}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 md:px-12 border-t border-border/30 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <img src={logoImg} alt="Tara Pokes logo" className="h-12 w-12 object-contain opacity-80" />
          <div className="flex items-center gap-2 text-foreground/45 text-sm font-light">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.footer.location}</span>
          </div>
          <div className="text-foreground/35 text-xs font-light uppercase tracking-wider">
            &copy; {new Date().getFullYear()} {t.footer.copy}
          </div>
        </div>
      </footer>
    </main>
  );
}
