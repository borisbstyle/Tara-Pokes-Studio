import React, { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Instagram, Mail, MapPin, Plus, Minus, MessageCircle } from "lucide-react";

import heroImg from "@/assets/hero.png";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";
import gallery3 from "@/assets/gallery-3.png";
import gallery4 from "@/assets/gallery-4.png";
import gallery5 from "@/assets/gallery-5.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const faqs = [
  {
    q: "Do you use a machine at all?",
    a: "No, every piece is applied exclusively by handpoke. This method is slower but much gentler on the skin, resulting in less trauma and a softer, more organic healing process. It feels less like a procedure and more like a quiet ritual."
  },
  {
    q: "How should I prepare for my session?",
    a: "Please arrive well-rested, hydrated, and having eaten a solid meal. Avoid alcohol or excessive caffeine the night before. Wear comfortable clothing that allows easy access to the area being tattooed. Take it easy the day of."
  },
  {
    q: "Do handpoke tattoos fade faster?",
    a: "When applied correctly, handpoke tattoos are just as permanent as machine tattoos. Due to the delicate nature of fine-line work, some pieces might require a minor touch-up to maintain their crispness, which is completely normal."
  },
  {
    q: "Can I bring a friend to my appointment?",
    a: "Because the studio is small and the process requires deep focus and a calm environment, I ask that you come alone. This ensures the space remains quiet, peaceful, and fully dedicated to your experience."
  }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.2]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground noise-bg overflow-x-hidden selection:bg-primary/20">
      {/* 1. Navigation */}
      <nav className="absolute top-0 w-full z-40 px-6 py-6 md:px-12 flex justify-between items-center text-foreground pointer-events-auto">
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
            alt="Light airy tattoo studio" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/90"></div>
        </motion.div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
          <motion.p 
            initial={{ opacity: 0, tracking: "0em" }}
            animate={{ opacity: 1, tracking: "0.2em" }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-xs md:text-sm uppercase text-primary mb-6 font-light"
          >
            Prague, Czech Republic
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-serif mb-6 italic font-light text-foreground"
          >
            Tara Pokes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl text-foreground/70 max-w-lg font-light leading-relaxed"
          >
            Delicate, botanical handpoke tattoos.<br className="hidden md:block"/> Quiet craft, meaningful intent.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-xs uppercase tracking-widest text-foreground/40 font-light">Scroll gently</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/30 to-transparent"></div>
        </motion.div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="order-2 md:order-1"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif mb-8 text-foreground/90 leading-tight">Light, precise, personal.</motion.h2>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/70 mb-6 leading-relaxed font-light">
              Tara Pokes is a private studio offering bespoke, fine-line handpoke tattoos. Each piece is crafted dot by dot without a machine, honoring a slower, gentler approach to marking the skin.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-foreground/70 mb-10 leading-relaxed font-light">
              Focusing on botanical motifs, delicate script, and minimal abstraction, the work aims to feel like natural extensions of the body—like pressed flowers in a personal journal.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <a href="#booking" className="inline-flex items-center gap-3 text-sm uppercase tracking-widest border-b border-primary/30 pb-1 hover:border-primary transition-colors text-primary" data-testid="link-book-now">
                Request a session <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="order-1 md:order-2 aspect-[3/4] relative p-4 bg-white shadow-sm"
          >
            <img src={gallery4} alt="Tattoo artist workspace" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* 4. Philosophy Section */}
      <section id="philosophy" className="py-32 px-6 md:px-12 bg-white relative border-y border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs uppercase tracking-widest text-primary/70 mb-6 block">The Approach</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif italic mb-10 text-foreground/90 font-light">A Quiet Craft</motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/70 mb-8">
              Handpoke is inherently intimate. The absence of a buzzing machine allows for conversation, silence, and a calm environment. The process is a mutual exchange of trust and care.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light leading-relaxed text-foreground/70">
              The result is a tattoo that settles softly into the skin—precise, organic, and crafted with complete intention.
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
            <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">The Process</span>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground/90">From Concept to Skin</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                title: "01. Design",
                desc: "We begin by refining your idea. Drawing inspiration from nature, vintage botanical prints, or personal symbolism, a custom delicate design is drafted."
              },
              {
                title: "02. Environment",
                desc: "The private studio is a warm, light-filled space designed for comfort. We ensure the placement flows naturally with your body's anatomy before beginning."
              },
              {
                title: "03. Handpoke",
                desc: "Using only a sterilized needle and ink, the design is gently poked into the skin. It is a mindful, quiet process that heals beautifully and softly over time."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex flex-col border-t border-border/60 pt-8"
              >
                <h3 className="text-xl font-serif mb-4 text-foreground/90">{step.title}</h3>
                <p className="text-foreground/60 font-light text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery / Work Section */}
      <section id="work" className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-border/40">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4">Portfolio</span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-foreground/90 font-light">Selected Work</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-5 aspect-[4/5] relative group p-3 bg-white shadow-sm"
          >
            <img src={gallery1} alt="Delicate lavender tattoo" className="w-full h-full object-cover" />
          </motion.div>
          
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mt-12 md:mt-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="aspect-[3/4] relative group p-3 bg-white shadow-sm"
            >
              <img src={gallery3} alt="Simple flower handpoke" className="w-full h-full object-cover" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="aspect-[3/4] relative group mt-0 sm:mt-16 p-3 bg-white shadow-sm"
            >
              <img src={gallery2} alt="Delicate fern tattoo" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-12">
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-border/40 shadow-sm order-2 md:order-1">
            <p className="font-serif text-xl md:text-2xl text-center italic text-foreground/70 max-w-sm leading-relaxed font-light">
              "To mark the body is to honor it. Let it be delicate, intentional, and entirely yours."
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="aspect-[16/9] relative group p-3 bg-white shadow-sm order-1 md:order-2"
          >
            <img src={gallery5} alt="Tiny abstract symbol tattoo" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-32 px-6 md:px-12 max-w-3xl mx-auto border-t border-border/40">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary/70 mb-4 block">Details</span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground/90">Frequently Asked Questions</h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="border-b border-border/60"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left py-5 flex justify-between items-center text-foreground/90 font-serif text-lg md:text-xl"
                data-testid={`btn-faq-${i}`}
              >
                {faq.q}
                <span className="text-primary/60 ml-4 flex-shrink-0">
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
                    <div className="pb-6 pr-8 text-foreground/60 font-light text-sm md:text-base leading-relaxed">
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
      <section id="booking" className="py-32 px-6 md:px-12 relative overflow-hidden border-t border-border/40 bg-white">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs uppercase tracking-widest text-primary/70 mb-6 block">Appointments</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif mb-8 text-foreground/90 font-light">Request a Booking</motion.h2>
            <motion.p variants={fadeInUp} className="text-foreground/60 font-light text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              Books are currently open. I prioritize delicate botanical pieces, fine-line nature motifs, and custom minimalist concepts that align with the studio's aesthetic.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 items-center max-w-2xl mx-auto">
              <a 
                href="https://wa.me/31613415766" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm shadow-sm"
                data-testid="btn-whatsapp-booking"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp (+31 613 415 766)
              </a>
              <a 
                href="https://instagram.com/tara.pokes" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-border/80 hover:border-primary/50 hover:bg-secondary/50 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                data-testid="btn-ig-booking"
              >
                <Instagram className="w-4 h-4" />
                Instagram (@tara.pokes)
              </a>
              <a 
                href="mailto:tara@tarapokes.com" 
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-border/80 hover:border-primary/50 hover:bg-secondary/50 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                data-testid="btn-email-booking"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border/40 text-center md:text-left bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-xl italic text-foreground/80 font-light">Tara Pokes</div>
          <div className="flex items-center gap-2 text-foreground/50 text-sm font-light">
            <MapPin className="w-3.5 h-3.5" />
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
