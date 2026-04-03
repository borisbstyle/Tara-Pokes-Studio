import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Mail, MapPin, Plus, Minus } from "lucide-react";

import heroImg from "@/assets/hero.png";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";
import gallery3 from "@/assets/gallery-3.png";
import gallery4 from "@/assets/gallery-4.png";
import gallery5 from "@/assets/gallery-5.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const faqs = [
  {
    q: "Do you use a machine at all?",
    a: "No. Every piece is done exclusively by handpoke. This method is slower but much gentler on the skin, resulting in less trauma and a softer, more organic healing process."
  },
  {
    q: "How should I prepare for my session?",
    a: "Please arrive well-rested, hydrated, and having eaten a solid meal. Avoid alcohol or excessive caffeine the night before. Wear comfortable clothing that allows easy access to the area being tattooed."
  },
  {
    q: "Do handpoke tattoos fade faster?",
    a: "When applied correctly, handpoke tattoos are just as permanent as machine tattoos. However, due to the delicate nature of fine-line work, some pieces may require a minor touch-up to maintain their crispness."
  },
  {
    q: "Can I bring a friend to my appointment?",
    a: "Because the studio is small and the process requires deep focus and a calm environment, I ask that you come alone. This ensures the space remains quiet and sacred."
  }
];

export default function Home() {
  useEffect(() => {
    // Force dark mode for consistent rendering if class strategy is used
    document.documentElement.classList.add("dark");
  }, []);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground noise-bg overflow-x-hidden selection:bg-primary/20">
      {/* 1. Navigation */}
      <nav className="fixed top-0 w-full z-40 px-6 py-6 md:px-12 flex justify-between items-center mix-blend-difference text-white pointer-events-auto">
        <div className="font-serif text-xl tracking-widest uppercase">TARA POKES</div>
        <div className="hidden md:flex gap-8 text-sm font-light tracking-wider">
          <a href="#about" className="hover:text-primary transition-colors" data-testid="link-about">About</a>
          <a href="#philosophy" className="hover:text-primary transition-colors" data-testid="link-philosophy">Philosophy</a>
          <a href="#process" className="hover:text-primary transition-colors" data-testid="link-process">Process</a>
          <a href="#work" className="hover:text-primary transition-colors" data-testid="link-work">Work</a>
          <a href="#faq" className="hover:text-primary transition-colors" data-testid="link-faq">FAQ</a>
          <a href="#booking" className="hover:text-primary transition-colors" data-testid="link-booking">Booking</a>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <img 
            src={heroImg} 
            alt="Moody tattoo studio" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background"></div>
        </motion.div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.p 
            initial={{ opacity: 0, tracking: "0em" }}
            animate={{ opacity: 1, tracking: "0.2em" }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-xs md:text-sm uppercase text-primary/80 mb-6 font-light"
          >
            Prague, Czech Republic
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif mb-6 italic"
          >
            Tara Pokes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl text-foreground/70 max-w-lg font-light"
          >
            Intimate handpoke tattoos. <br className="hidden md:block"/> No machines, just needles and intention.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-foreground/50">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="order-2 md:order-1"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif mb-8 text-primary">Quiet, Sacred, Wild.</motion.h2>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/80 mb-6 leading-relaxed font-light">
              Tara Pokes is a private studio where every piece is hand-drawn and needle-applied by hand. The work is slow, deliberate, and deeply personal. 
            </motion.p>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/80 mb-8 leading-relaxed font-light">
              Specializing in fine-line botanical motifs, abstract patterns, and minimal symbolic pieces. Each session is an intersection of fine art and ritual—designed for those who want something meaningful, not trendy.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <a href="#booking" className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b border-primary/30 pb-1 hover:border-primary transition-colors" data-testid="link-book-now">
                Book a session <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="order-1 md:order-2 aspect-[3/4] relative"
          >
            <img src={gallery4} alt="Tattoo artist workspace" className="w-full h-full object-cover grayscale-[0.3]" />
            <div className="absolute inset-0 bg-background/10 mix-blend-overlay"></div>
          </motion.div>
        </div>
      </section>

      {/* 4. Philosophy Section */}
      <section id="philosophy" className="py-32 px-6 md:px-12 bg-secondary/10 relative border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs uppercase tracking-widest text-primary mb-4 block">Philosophy</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-serif italic mb-10 text-foreground/90">A Return to the Source</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/70 mb-8">
              In a world obsessed with speed, handpoke tattooing is an act of resistance. It is not about how quickly we can mark the skin, but how deeply we can connect with the experience of doing so. 
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/70">
              The hum of a machine is replaced by silence, the sting of a motor is replaced by the rhythm of a single needle. It is a primitive, profound process that honors the body and the art equally.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 5. Process Section */}
      <section id="process" className="py-32 relative">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <span className="text-xs uppercase tracking-widest text-primary mb-4 block">The Method</span>
            <h2 className="text-4xl md:text-5xl font-serif">Handpoke Only</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "01. Concept",
                desc: "Every design starts with a conversation. We discuss your intention, placement, and elements to create a custom piece."
              },
              {
                title: "02. Ritual",
                desc: "The studio space is prepared. Candles are lit. The environment is kept quiet and calm to honor the process."
              },
              {
                title: "03. Application",
                desc: "Ink is pushed into the skin dot by dot. It is a gentler, quieter method that heals softer and feels more intentional."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col border-t border-border pt-6"
              >
                <h3 className="text-xl font-serif mb-4 text-primary/90">{step.title}</h3>
                <p className="text-foreground/70 font-light text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery / Work Section */}
      <section id="work" className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-border/30">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16 md:mb-24 flex justify-between items-end"
        >
          <h2 className="text-5xl md:text-7xl font-serif italic text-primary/80">Selected Work</h2>
          <span className="text-xs uppercase tracking-widest text-foreground/50 hidden md:block">Prague, CZ</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-5 aspect-[4/5] relative group"
          >
            <img src={gallery1} alt="Handpoke process" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500"></div>
          </motion.div>
          
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 mt-12 md:mt-32">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="aspect-[3/4] relative group"
            >
              <img src={gallery3} alt="Finished minimal tattoo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="aspect-[3/4] relative group mt-0 sm:mt-24"
            >
              <img src={gallery2} alt="Botanical flash sheet" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.2]" />
              <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-6 md:mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="aspect-[16/9] relative group"
          >
            <img src={gallery5} alt="Abstract ink and smoke" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-background/40 group-hover:bg-background/10 transition-colors duration-500"></div>
          </motion.div>
          <div className="flex items-center justify-center p-12 bg-secondary/10 border border-border">
            <p className="font-serif text-2xl md:text-3xl text-center italic text-foreground/80 max-w-md leading-snug">
              "The pain is temporary, but the intention remains forever."
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-32 px-6 md:px-12 max-w-4xl mx-auto border-t border-border/30">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary mb-4 block">Questions</span>
          <h2 className="text-4xl md:text-5xl font-serif">Frequently Asked</h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border border-border/50 bg-secondary/5"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex justify-between items-center text-foreground/90 font-serif text-xl"
                data-testid={`btn-faq-${i}`}
              >
                {faq.q}
                <span className="text-primary/70">
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
                    <div className="px-6 pb-6 text-foreground/70 font-light text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. Booking / Contact Section */}
      <section id="booking" className="py-32 px-6 md:px-12 relative overflow-hidden border-t border-border bg-secondary/5">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-sm uppercase tracking-widest text-primary mb-6 block">Appointments</motion.span>
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-serif mb-8">Request a Booking</motion.h2>
            <motion.p variants={fadeInUp} className="text-foreground/70 font-light text-lg max-w-2xl mx-auto mb-12">
              Books are currently open. Please note that as a private studio, spaces are limited. I prioritize botanical pieces, abstract fine-line, and custom concepts that align with the studio's aesthetic.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-6 items-center">
              <a 
                href="mailto:tara@tarapokes.com" 
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-medium"
                data-testid="btn-email-booking"
              >
                <Mail className="w-4 h-4" />
                Email Request
              </a>
              <a 
                href="https://instagram.com/tarapokes" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-border hover:border-primary/50 hover:bg-white/5 transition-colors uppercase tracking-widest text-xs font-medium"
                data-testid="btn-ig-booking"
              >
                <Instagram className="w-4 h-4" />
                DM on Instagram
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border text-center md:text-left bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-2xl italic text-primary/80">Tara Pokes</div>
          <div className="flex items-center gap-2 text-foreground/50 text-sm font-light">
            <MapPin className="w-4 h-4" />
            <span>Prague, Czech Republic</span>
          </div>
          <div className="text-foreground/40 text-xs font-light uppercase tracking-wider">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
