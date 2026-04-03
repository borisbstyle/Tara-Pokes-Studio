import { createContext, useContext, useState } from "react";

export type Language = "nl" | "en";

const translations = {
  nl: {
    nav: {
      brand: "TARA POKES",
      about: "Over",
      philosophy: "Filosofie",
      process: "Proces",
      work: "Werk",
      faq: "FAQ",
      booking: "Afspraak",
    },
    hero: {
      location: "Uden, Nederland",
      tagline: "Delicate, botanische handpoke tattoos.",
      sub: "Stille ambacht, betekenisvolle intentie.",
      scroll: "Scroll zachtjes",
    },
    about: {
      heading: "Licht, precies, persoonlijk.",
      p1: "Tara Pokes is een privé studio voor op maat gemaakte, fijnlijn handpoke tattoos. Elk stuk wordt punt voor punt met de hand gemaakt — zonder machine — wat zorgt voor een zachtere, organische benadering van het tekenen op de huid.",
      p2: "Met een focus op botanische motieven, delicate vormen en minimale abstractie is elk werk bedoeld als een natuurlijke aanvulling op het lichaam — als geperste bloemen in een persoonlijk dagboek.",
      cta: "Een sessie aanvragen",
    },
    philosophy: {
      label: "De Aanpak",
      heading: "Een Stille Ambacht",
      p1: "Handpoke is van nature intiem. De afwezigheid van een zoemendemachine maakt ruimte voor gesprek, stilte en een rustige omgeving. Het proces is een wederzijdse uitwisseling van vertrouwen en zorg.",
      p2: "Het resultaat is een tattoo die zacht in de huid nestelt — precies, organisch en met volledige intentie gemaakt.",
    },
    process: {
      label: "Het Proces",
      heading: "Van Concept tot Huid",
      steps: [
        {
          title: "01. Ontwerp",
          desc: "We beginnen met het verfijnen van je idee. Geïnspireerd door de natuur, vintage botanische prenten of persoonlijke symboliek wordt een op maat gemaakt, delicaat ontwerp gemaakt.",
        },
        {
          title: "02. Omgeving",
          desc: "De privé studio is een warm, lichtdoorstroomd interieur ontworpen voor comfort. We zorgen dat de plaatsing natuurlijk aansluit bij de anatomie van je lichaam voordat we beginnen.",
        },
        {
          title: "03. Handpoke",
          desc: "Met alleen een gesteriliseerde naald en inkt wordt het ontwerp zachtjes in de huid geprikt. Het is een bewust, stil proces dat mooi en zacht geneest.",
        },
      ],
    },
    gallery: {
      label: "Portfolio",
      heading: "Geselecteerd Werk",
      quote: "\u201cHet lichaam markeren is het eren. Laat het delicaat, intentioneel en volledig van jou zijn.\u201d",
    },
    faq: {
      label: "Details",
      heading: "Veelgestelde Vragen",
      items: [
        {
          q: "Gebruik je ook een machine?",
          a: "Nee, elk stuk wordt uitsluitend met de hand geprikt. Deze methode is langzamer maar veel zachter voor de huid, resulteert in minder trauma en een zachter, organischer genezingsproces. Het voelt minder als een procedure en meer als een rustig ritueel.",
        },
        {
          q: "Hoe bereid ik me voor op mijn sessie?",
          a: "Kom uitgerust, goed gehydrateerd en na een stevige maaltijd. Vermijd alcohol of overmatige cafeïne de avond van tevoren. Draag comfortabele kleding die gemakkelijk toegang geeft tot het te tatoeëren gebied. Neem het rustig op de dag zelf.",
        },
        {
          q: "Vervagen handpoke tattoos sneller?",
          a: "Mits correct aangebracht, zijn handpoke tattoos net zo permanent als machine tattoos. Door het delicate karakter van fijnlijnwerk kan een kleine opfrisbeurt nodig zijn om de scherpte te behouden — wat volkomen normaal is.",
        },
        {
          q: "Mag ik een vriend(in) meenemen naar mijn afspraak?",
          a: "Omdat de studio klein is en het proces diepe focus en een rustige omgeving vereist, vraag ik je om alleen te komen. Dit zorgt ervoor dat de ruimte stil, vredig en volledig aan jouw ervaring gewijd blijft.",
        },
      ],
    },
    booking: {
      label: "Afspraken",
      heading: "Een Afspraak Aanvragen",
      body: "De agenda is momenteel open. Ik geef prioriteit aan delicate botanische stukken, fijnlijn natuurmotieven en op maat gemaakte minimalistische concepten die passen bij de stijl van de studio.",
      whatsapp: "WhatsApp (+31 613 415 766)",
      instagram: "Instagram (@tara.pokes)",
      email: "E-mail",
    },
    footer: {
      location: "Uden, Nederland",
      copy: "Alle rechten voorbehouden.",
    },
    chatbot: {
      label: "Consult",
      studioName: "Tara Pokes",
      title: "Tattoo Consultatie",
      welcome:
        "Welkom. Ik ben hier om je te helpen je tattooidee te verkennen voordat je contact opneemt met Tara. Vertel me — wat heb je in gedachten? Heb je een concept, een gevoel, of zelfs maar een vaag beeld waar je steeds aan terugdenkt?",
      placeholder: "Beschrijf je tattooidee...",
      emailPrompt: "Stuur een samenvatting van dit gesprek per e-mail",
      emailPlaceholder: "jouw@email.com",
      sendEmail: "Samenvatting Versturen",
      emailSent: "Samenvatting verzonden. Tara neemt binnenkort contact op.",
      errorGeneric: "Verbindingsprobleem. Probeer het opnieuw.",
    },
    langToggle: "EN",
  },
  en: {
    nav: {
      brand: "TARA POKES",
      about: "About",
      philosophy: "Philosophy",
      process: "Process",
      work: "Work",
      faq: "FAQ",
      booking: "Booking",
    },
    hero: {
      location: "Uden, Netherlands",
      tagline: "Delicate, botanical handpoke tattoos.",
      sub: "Quiet craft, meaningful intent.",
      scroll: "Scroll gently",
    },
    about: {
      heading: "Light, precise, personal.",
      p1: "Tara Pokes is a private studio offering bespoke, fine-line handpoke tattoos. Each piece is crafted dot by dot without a machine, honoring a slower, gentler approach to marking the skin.",
      p2: "Focusing on botanical motifs, delicate script, and minimal abstraction, the work aims to feel like natural extensions of the body — like pressed flowers in a personal journal.",
      cta: "Request a session",
    },
    philosophy: {
      label: "The Approach",
      heading: "A Quiet Craft",
      p1: "Handpoke is inherently intimate. The absence of a buzzing machine allows for conversation, silence, and a calm environment. The process is a mutual exchange of trust and care.",
      p2: "The result is a tattoo that settles softly into the skin — precise, organic, and crafted with complete intention.",
    },
    process: {
      label: "The Process",
      heading: "From Concept to Skin",
      steps: [
        {
          title: "01. Design",
          desc: "We begin by refining your idea. Drawing inspiration from nature, vintage botanical prints, or personal symbolism, a custom delicate design is drafted.",
        },
        {
          title: "02. Environment",
          desc: "The private studio is a warm, light-filled space designed for comfort. We ensure the placement flows naturally with your body's anatomy before beginning.",
        },
        {
          title: "03. Handpoke",
          desc: "Using only a sterilized needle and ink, the design is gently poked into the skin. It is a mindful, quiet process that heals beautifully and softly over time.",
        },
      ],
    },
    gallery: {
      label: "Portfolio",
      heading: "Selected Work",
      quote: "\u201cTo mark the body is to honor it. Let it be delicate, intentional, and entirely yours.\u201d",
    },
    faq: {
      label: "Details",
      heading: "Frequently Asked Questions",
      items: [
        {
          q: "Do you use a machine at all?",
          a: "No, every piece is applied exclusively by handpoke. This method is slower but much gentler on the skin, resulting in less trauma and a softer, more organic healing process. It feels less like a procedure and more like a quiet ritual.",
        },
        {
          q: "How should I prepare for my session?",
          a: "Please arrive well-rested, hydrated, and having eaten a solid meal. Avoid alcohol or excessive caffeine the night before. Wear comfortable clothing that allows easy access to the area being tattooed. Take it easy the day of.",
        },
        {
          q: "Do handpoke tattoos fade faster?",
          a: "When applied correctly, handpoke tattoos are just as permanent as machine tattoos. Due to the delicate nature of fine-line work, some pieces might require a minor touch-up to maintain their crispness, which is completely normal.",
        },
        {
          q: "Can I bring a friend to my appointment?",
          a: "Because the studio is small and the process requires deep focus and a calm environment, I ask that you come alone. This ensures the space remains quiet, peaceful, and fully dedicated to your experience.",
        },
      ],
    },
    booking: {
      label: "Appointments",
      heading: "Request a Booking",
      body: "Books are currently open. I prioritize delicate botanical pieces, fine-line nature motifs, and custom minimalist concepts that align with the studio's aesthetic.",
      whatsapp: "WhatsApp (+31 613 415 766)",
      instagram: "Instagram (@tara.pokes)",
      email: "Email",
    },
    footer: {
      location: "Uden, Netherlands",
      copy: "All rights reserved.",
    },
    chatbot: {
      label: "Consult",
      studioName: "Tara Pokes",
      title: "Tattoo Consultation",
      welcome:
        "Welcome. I'm here to help you explore your tattoo idea before you reach out to Tara. Tell me — what's on your mind? Do you have a concept, a feeling, or even just a vague image you keep coming back to?",
      placeholder: "Describe your tattoo idea...",
      emailPrompt: "Email this consultation summary",
      emailPlaceholder: "your@email.com",
      sendEmail: "Send Summary",
      emailSent: "Summary sent. Tara will be in touch soon.",
      errorGeneric: "Connection issue. Please try again.",
    },
    langToggle: "NL",
  },
} as const;

export type Translations = typeof translations.nl;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("nl");
  const toggle = () => setLang((l) => (l === "nl" ? "en" : "nl"));
  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
