// Simple i18n: EN / SQ (Albanian) / DE (German).
// Technical terms (frontend, backend, API, CMS, SEO, PWA, i18n, etc.) are
// intentionally left untranslated in every language.
//
// Ported from the original static site's i18n.js into a React context +
// hook. Behavior preserved: translations keyed the same way, language
// persisted to localStorage under "site-lang", <html lang="..."> kept in
// sync, and unknown keys simply fall back to whatever JSX children/fallback
// text was passed in (mirrors the original's "leave existing text alone if
// key not found" behavior).

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const translations = {
  en: {
    "nav.work": "Work",
    "nav.skills": "Skills",
    "nav.services": "Services",
    "nav.process": "Process",
    "nav.contact": "Contact",
    "hero.eyebrow": "WEB DEVELOPMENT",
    "hero.title": "A website that makes clients trust your brand.",
    "hero.sub": "I design and build fast, professional sites that make small businesses and independent projects look established.",
    "hero.point1": "Custom design, not a template",
    "hero.point2": "Fast load times, built to convert",
    "hero.point3": "A site you'll actually be proud to share",
    "hero.cta1": "Get in touch",
    "hero.cta2": "See my work",
    "work.title": "Work",
    "work.p1.tag": "Movie & TV picker",
    "work.p1.desc": "A tool for groups who can't agree on what to watch. Spin a wheel, describe a mood, or swipe through picks together. Includes four built-in games, works offline as an installable app, and is available in three languages.",
    "work.p2.tag": "Coaching platform",
    "work.p2.desc": "A site for a coach offering online and 1-on-1 sessions, built so a new visitor can understand the offer and book a session without friction.",
    "work.live": "Live site ↗",
    "work.source": "Source code ↗",
    "skills.title": "Skills & Experience",
    "services.title": "Services",
    "services.sub": "Prices vary by scope. This is a starting point.",
    "services.from": "+",
    "services.custom": "Custom quote",
    "services.p1.tag": "Landing page",
    "services.p1.desc": "A single, focused page — for a business, event, or launch. Fast to build, fast to load.",
    "services.p1.i1": "Custom design, no templates",
    "services.p1.i2": "Mobile-first, responsive layout",
    "services.p1.i3": "Basic SEO setup",
    "services.p2.tag": "Multi-page website",
    "services.p2.desc": "Several pages, a contact form, and content structured the way your visitors actually browse.",
    "services.p2.i1": "Everything in Landing page",
    "services.p2.i2": "Contact form & content pages",
    "services.p2.i3": "Multi-language support",
    "services.p3.tag": "Web app / tool",
    "services.p3.desc": "Booking systems, calculators, dashboards — anything interactive beyond a static page.",
    "services.p3.i1": "Frontend + backend as needed",
    "services.p3.i2": "API integrations",
    "services.p3.i3": "Scoped after a short call",
    "process.title": "How it works",
    "process.s1.h": "Brief",
    "process.s1.p": "You tell me what you need and who it's for. I ask questions until the scope, pages, and features are clear, then send you a fixed quote before anything starts.",
    "process.s2.h": "Domain & hosting",
    "process.s2.p": "You purchase your own domain name (I'll point you to a registrar and help pick one if needed) — this keeps it fully in your name and under your control. I handle connecting it to the finished site.",
    "process.s3.h": "Build",
    "process.s3.p": "I build it, and you see progress along the way — not just a reveal at the end.",
    "process.s4.h": "Launch",
    "process.s4.p": "Your site goes live on your domain. I stay reachable after launch for fixes and small changes.",
    "contact.title": "Let's build something",
    "contact.sub": "Tell me what you're trying to build. I'll reply within a day or two.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.msg": "What do you need built?",
    "contact.send": "Send message",
    "contact.alt": "Or reach me directly",
    "footer.loc": "© 2026 — All rights reserved"
  },

  sq: {
    "nav.work": "Punimet",
    "nav.skills": "Aftësitë",
    "nav.services": "Shërbimet",
    "nav.process": "Procesi",
    "nav.contact": "Kontakt",
    "hero.eyebrow": "WEB DEVELOPMENT",
    "hero.title": "Një website që i jep klientëve besim tek marka juaj.",
    "hero.sub": "Dizajnoj dhe ndërtoj sajte të shpejta dhe profesionale, që i japin biznesit tuaj pamjen e një marke të konsoliduar.",
    "hero.point1": "Dizajn i personalizuar, jo template",
    "hero.point2": "Kohë ngarkimi të shpejta, ndërtuar për konvertim",
    "hero.point3": "Një sajt që me të vërtetë do të krenoheni ta ndani",
    "hero.cta1": "Na kontaktoni",
    "hero.cta2": "Shiko punimet",
    "work.title": "Punimet",
    "work.p1.tag": "Zgjedhës filmash & seriale",
    "work.p1.desc": "Një mjet për grupe që nuk bien dakord se çfarë të shohin. Rrotullo timonin, përshkruaj humorin e momentit, ose kalo nëpër zgjedhje së bashku. Përfshin katër lojëra të integruara, punon offline si një PWA e instalueshme, dhe ofrohet në tre gjuhë.",
    "work.p2.tag": "Platformë trajnimi",
    "work.p2.desc": "Një sajt për një coach që ofron sesione online dhe 1-me-1, ndërtuar në mënyrë që një vizitor i ri të kuptojë ofertën dhe të rezervojë një sesion pa vështirësi.",
    "work.live": "Sajti live ↗",
    "work.source": "Kodi burimor ↗",
    "skills.title": "Aftësi & Eksperiencë",
    "services.title": "Shërbimet",
    "services.sub": "Çmimi varet nga vëllimi i punës. Ky është një pikënisje.",
    "services.from": "+",
    "services.custom": "Ofertë e personalizuar",
    "services.p1.tag": "Faqe e vetme (landing page)",
    "services.p1.desc": "Një faqe e vetme, e fokusuar — për një biznes, event, ose lançim. Shpejt për t'u ndërtuar, shpejt për t'u hapur.",
    "services.p1.i1": "Dizajn i personalizuar, jo template",
    "services.p1.i2": "Mobile-first, layout responsive",
    "services.p1.i3": "Konfigurim bazë SEO",
    "services.p2.tag": "Website me shumë faqe",
    "services.p2.desc": "Disa faqe, një formular kontakti, dhe përmbajtje e strukturuar sipas mënyrës si lundrojnë vizitorët në të vërtetë.",
    "services.p2.i1": "Gjithçka nga Landing page",
    "services.p2.i2": "Formular kontakti & faqe përmbajtjeje",
    "services.p2.i3": "Mbështetje shumëgjuhëshe",
    "services.p3.tag": "Web app / mjet",
    "services.p3.desc": "Sisteme rezervimi, kalkulatorë, dashboard — çdo gjë interaktive përtej një faqeje statike.",
    "services.p3.i1": "Frontend + backend sipas nevojës",
    "services.p3.i2": "Integrime API",
    "services.p3.i3": "Përcaktohet pas një bisede të shkurtër",
    "process.title": "Si funksionon",
    "process.s1.h": "Brief",
    "process.s1.p": "Më tregoni çfarë ju duhet dhe për kë është. Bëj pyetje derisa vëllimi i punës, faqet, dhe funksionalitetet të jenë të qarta, pastaj ju dërgoj një ofertë fikse para se të fillojë puna.",
    "process.s2.h": "Domain & hosting",
    "process.s2.p": "Ju vetë blini domain-in tuaj (ju drejtoj te një regjistrues dhe ju ndihmoj ta zgjidhni nëse duhet) — kjo e mban atë plotësisht në emrin tuaj dhe nën kontrollin tuaj. Unë kujdesem për lidhjen e tij me sajtin e përfunduar.",
    "process.s3.h": "Ndërtimi",
    "process.s3.p": "E ndërtoj, dhe ju e shihni progresin gjatë rrugës — jo vetëm një zbulim në fund.",
    "process.s4.h": "Lançimi",
    "process.s4.p": "Sajti juaj shkon live në domain-in tuaj. Mbetem i arritshëm pas lançimit për ndreqje dhe ndryshime të vogla.",
    "contact.title": "Kontakt",
    "contact.sub": "Më tregoni çfarë po përpiqeni të ndërtoni. Përgjigjem brenda një apo dy ditësh.",
    "contact.name": "Emri",
    "contact.email": "Email",
    "contact.msg": "Çfarë ju duhet të ndërtohet?",
    "contact.send": "Dërgo mesazhin",
    "contact.alt": "Ose më kontaktoni direkt",
    "footer.loc": "© 2026 — Të gjitha të drejtat e rezervuara"
  },

  de: {
    "nav.work": "Projekte",
    "nav.skills": "Fähigkeiten",
    "nav.services": "Leistungen",
    "nav.process": "Ablauf",
    "nav.contact": "Kontakt",
    "hero.eyebrow": "WEB DEVELOPMENT",
    "hero.title": "Eine Website, die Vertrauen in deine Marke schafft.",
    "hero.sub": "Ich entwerfe und baue schnelle, professionelle Websites, die kleine Unternehmen und unabhängige Projekte etabliert wirken lassen.",
    "hero.point1": "Individuelles Design, keine Vorlage",
    "hero.point2": "Schnelle Ladezeiten, gebaut für Conversions",
    "hero.point3": "Eine Seite, auf die du wirklich stolz bist",
    "hero.cta1": "Kontakt aufnehmen",
    "hero.cta2": "Projekte ansehen",
    "work.title": "Projekte",
    "work.p1.tag": "Film- & Serien-Picker",
    "work.p1.desc": "Ein Tool für Gruppen, die sich nicht einigen können, was sie schauen sollen. Rad drehen, Stimmung beschreiben, oder gemeinsam durch Vorschläge swipen. Enthält vier integrierte Spiele, funktioniert offline als installierbare PWA und ist in drei Sprachen verfügbar.",
    "work.p2.tag": "Coaching-Plattform",
    "work.p2.desc": "Eine Seite für einen Coach mit Online- und 1-zu-1-Sitzungen, so gebaut, dass ein neuer Besucher das Angebot versteht und ohne Reibung eine Sitzung bucht.",
    "work.live": "Live-Seite ↗",
    "work.source": "Quellcode ↗",
    "skills.title": "Skills & Erfahrung",
    "services.title": "Leistungen",
    "services.sub": "Der Preis hängt vom Umfang ab. Das ist ein Ausgangspunkt.",
    "services.from": "+",
    "services.custom": "Individuelles Angebot",
    "services.p1.tag": "Landingpage",
    "services.p1.desc": "Eine einzelne, fokussierte Seite — für ein Unternehmen, Event, oder einen Launch. Schnell gebaut, schnell geladen.",
    "services.p1.i1": "Individuelles Design, keine Templates",
    "services.p1.i2": "Mobile-first, responsives Layout",
    "services.p1.i3": "Grundlegendes SEO-Setup",
    "services.p2.tag": "Mehrseitige Website",
    "services.p2.desc": "Mehrere Seiten, ein Kontaktformular, und Inhalte, die so strukturiert sind, wie deine Besucher tatsächlich navigieren.",
    "services.p2.i1": "Alles aus Landingpage",
    "services.p2.i2": "Kontaktformular & Inhaltsseiten",
    "services.p2.i3": "Mehrsprachige Unterstützung",
    "services.p3.tag": "Web-App / Tool",
    "services.p3.desc": "Buchungssysteme, Rechner, Dashboards — alles Interaktive über eine statische Seite hinaus.",
    "services.p3.i1": "Frontend + Backend nach Bedarf",
    "services.p3.i2": "API-Integrationen",
    "services.p3.i3": "Umfang nach kurzem Gespräch",
    "process.title": "So läuft's ab",
    "process.s1.h": "Briefing",
    "process.s1.p": "Du sagst mir, was du brauchst und für wen. Ich stelle Fragen, bis Umfang, Seiten, und Funktionen klar sind, und schicke dir dann ein Festpreisangebot, bevor irgendetwas beginnt.",
    "process.s2.h": "Domain & Hosting",
    "process.s2.p": "Du kaufst deine eigene Domain selbst (ich empfehle dir einen Registrar und helfe bei der Auswahl, falls nötig) — so bleibt sie vollständig in deinem Namen und unter deiner Kontrolle. Ich kümmere mich um die Verbindung mit der fertigen Seite.",
    "process.s3.h": "Umsetzung",
    "process.s3.p": "Ich baue die Seite, und du siehst den Fortschritt unterwegs — nicht nur eine Enthüllung am Ende.",
    "process.s4.h": "Launch",
    "process.s4.p": "Deine Seite geht live auf deiner Domain. Ich bleibe nach dem Launch für Korrekturen und kleine Änderungen erreichbar.",
    "contact.title": "Kontakt",
    "contact.sub": "Sag mir, was du bauen möchtest. Ich melde mich innerhalb von ein bis zwei Tagen.",
    "contact.name": "Name",
    "contact.email": "E-Mail",
    "contact.msg": "Was soll gebaut werden?",
    "contact.send": "Nachricht senden",
    "contact.alt": "Oder erreiche mich direkt",
    "footer.loc": "© 2026 — Alle Rechte vorbehalten"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // On mount, restore saved language (mirrors original DOMContentLoaded logic).
  useEffect(() => {
    let saved = "en";
    try {
      saved = localStorage.getItem("site-lang") || "en";
    } catch {
      /* ignore */
    }
    if (!translations[saved]) saved = "en";
    setLangState(saved);
  }, []);

  // Keep <html lang="..."> in sync, same as the original applyLanguage().
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    const safe = translations[next] ? next : "en";
    setLangState(safe);
    try {
      localStorage.setItem("site-lang", safe);
    } catch {
      /* localStorage unavailable — language just won't persist */
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// useTranslation: t(key, fallback) looks up the current language's string;
// if the key isn't found (same as the original's "value !== undefined"
// guard) it returns the fallback (usually the original hardcoded English
// JSX text) instead, so nothing ever renders blank.
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider");
  const { lang, setLang } = ctx;

  const t = useCallback(
    (key, fallback) => {
      const value = translations[lang]?.[key];
      return value !== undefined ? value : fallback;
    },
    [lang]
  );

  return { t, lang, setLang };
}
