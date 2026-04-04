import { createContext, useContext, useState } from "react";

export type Language = "nl" | "en";

const translations = {
  nl: {
    nav: {
      brand: "TARA POKES",
      work: "Werk",
      why: "Waarom",
      reviews: "Reviews",
      flash: "Flash",
      booking: "Afspraak",
    },
    hero: {
      location: "Uden, Nederland",
      title: "Minimal handpoke tattoos",
      subtitle: "Subtle. Personal. Permanent.",
      extra: "Voor mensen die iets echts willen, geen standaard werk.",
      cta1: "Boek je afspraak",
      cta2: "Bekijk mijn werk",
      scroll: "Scroll zachtjes",
    },
    portfolio: {
      label: "Portfolio",
      title: "Mijn werk",
      subtitle: "Elke tattoo is met de hand gezet. Uniek, precies en met aandacht.",
    },
    why: {
      title: "Waarom kiezen voor Tara Pokes",
      bullets: [
        "Gespecialiseerd in handpoke tattoos (geen machine)",
        "Minimalistische stijl met oog voor detail",
        "Persoonlijk ontwerp, afgestemd op jou",
        "Rustige en veilige setting",
        "Hygiënisch en professioneel",
      ],
    },
    reviews: {
      title: "Wat klanten zeggen",
      items: [
        { quote: "Super strak en precies werk. Heel blij met het resultaat.", name: "Emma" },
        { quote: "Voelde me meteen op mijn gemak. Echt vakwerk.", name: "Sara" },
        { quote: "Precies wat ik wilde. Minimal en clean.", name: "Julia" },
        { quote: "Heel fijne ervaring, neemt echt de tijd voor je.", name: "Lisa" },
      ],
    },
    flash: {
      label: "Flash",
      title: "Flash designs",
      text: "Kies een design en claim direct je plek.\nOp = op.",
      cta: "Claim deze tattoo",
    },
    howItWorks: {
      label: "Werkwijze",
      title: "Hoe het werkt",
      steps: [
        { num: "01", text: "Stuur me een bericht met je idee" },
        { num: "02", text: "We bespreken het ontwerp en de details" },
        { num: "03", text: "We plannen een afspraak" },
        { num: "04", text: "Jij gaat naar huis met je tattoo" },
      ],
    },
    hygiene: {
      label: "Veiligheid",
      title: "Hygiëne & veiligheid",
      text: "Ik werk altijd volgens strikte hygiëneregels.\nAlles is steriel en veilig, zodat jij zonder zorgen je tattoo kunt laten zetten.",
    },
    faq: {
      label: "FAQ",
      title: "Veelgestelde vragen",
      items: [
        {
          q: "Gebruik je ook een machine?",
          a: "Nee, elk stuk wordt uitsluitend met de hand geprikt. Deze methode is langzamer maar veel zachter voor de huid, resulteert in minder trauma en een zachter, organischer genezingsproces.",
        },
        {
          q: "Hoe bereid ik me voor op mijn sessie?",
          a: "Kom uitgerust, goed gehydrateerd en na een stevige maaltijd. Vermijd alcohol de avond van tevoren. Draag comfortabele kleding die gemakkelijk toegang geeft tot het te tatoeëren gebied.",
        },
        {
          q: "Vervagen handpoke tattoos sneller?",
          a: "Mits correct aangebracht zijn handpoke tattoos net zo permanent als machine tattoos. Een kleine opfrisbeurt kan nodig zijn om de scherpte te behouden, wat volkomen normaal is.",
        },
        {
          q: "Mag ik een vriend(in) meenemen?",
          a: "Omdat de studio klein is en het proces diepe focus vereist, vraag ik je om alleen te komen. Dit zorgt ervoor dat de ruimte rustig en volledig aan jouw ervaring gewijd blijft.",
        },
      ],
    },
    booking: {
      label: "Afspraken",
      title: "Boek je afspraak",
      text: "Stuur me een berichtje via WhatsApp of Instagram. Ik plan afspraken in op basis van beschikbaarheid.",
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
        "Welkom. Ik ben hier om je te helpen je tattooidee te verkennen voordat je contact opneemt met Tara. Vertel me — wat heb je in gedachten?",
      placeholder: "Beschrijf je tattooidee...",
      emailPrompt: "Stuur een samenvatting per e-mail",
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
      work: "Work",
      why: "Why",
      reviews: "Reviews",
      flash: "Flash",
      booking: "Booking",
    },
    hero: {
      location: "Uden, Netherlands",
      title: "Minimal handpoke tattoos",
      subtitle: "Subtle. Personal. Permanent.",
      extra: "For people who want something real, not standard work.",
      cta1: "Book your appointment",
      cta2: "See my work",
      scroll: "Scroll gently",
    },
    portfolio: {
      label: "Portfolio",
      title: "My work",
      subtitle: "Every tattoo is applied by hand. Unique, precise and with care.",
    },
    why: {
      title: "Why choose Tara Pokes",
      bullets: [
        "Specialised in handpoke tattoos (no machine)",
        "Minimalist style with an eye for detail",
        "Custom design, tailored to you",
        "Calm and safe environment",
        "Hygienic and professional",
      ],
    },
    reviews: {
      title: "What clients say",
      items: [
        { quote: "Super precise and clean work. Really happy with the result.", name: "Emma" },
        { quote: "Felt at ease immediately. True craftsmanship.", name: "Sara" },
        { quote: "Exactly what I wanted. Minimal and clean.", name: "Julia" },
        { quote: "Such a lovely experience, she really takes her time for you.", name: "Lisa" },
      ],
    },
    flash: {
      label: "Flash",
      title: "Flash designs",
      text: "Choose a design and claim your spot right away.\nFirst come, first served.",
      cta: "Claim this tattoo",
    },
    howItWorks: {
      label: "Process",
      title: "How it works",
      steps: [
        { num: "01", text: "Send me a message with your idea" },
        { num: "02", text: "We discuss the design and details" },
        { num: "03", text: "We schedule an appointment" },
        { num: "04", text: "You go home with your tattoo" },
      ],
    },
    hygiene: {
      label: "Safety",
      title: "Hygiene & safety",
      text: "I always work according to strict hygiene standards.\nEverything is sterile and safe, so you can get your tattoo without any worries.",
    },
    faq: {
      label: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          q: "Do you use a machine at all?",
          a: "No, every piece is applied exclusively by handpoke. This method is slower but much gentler on the skin, resulting in less trauma and a softer, more organic healing process.",
        },
        {
          q: "How should I prepare for my session?",
          a: "Please arrive well-rested, hydrated, and having eaten a solid meal. Avoid alcohol the night before. Wear comfortable clothing that allows easy access to the area being tattooed.",
        },
        {
          q: "Do handpoke tattoos fade faster?",
          a: "When applied correctly, handpoke tattoos are just as permanent as machine tattoos. A minor touch-up may be needed to maintain crispness, which is completely normal.",
        },
        {
          q: "Can I bring a friend?",
          a: "Because the studio is small and the process requires deep focus, I ask that you come alone. This ensures the space remains quiet and fully dedicated to your experience.",
        },
      ],
    },
    booking: {
      label: "Appointments",
      title: "Book your appointment",
      text: "Send me a message via WhatsApp or Instagram. I schedule appointments based on availability.",
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
        "Welcome. I'm here to help you explore your tattoo idea before you reach out to Tara. Tell me — what's on your mind?",
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
